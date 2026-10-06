import 'server-only';

import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  sortFromParam,
  sortToParam,
  type GridQuery,
  type PageResult,
} from '@/shared/models/pagination';
import { ServerApiError } from './types';

type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export interface ParseGridQueryOptions {
  /** Campos ordenables (lista blanca, igual que en el backend). */
  sortable: readonly string[];
  /** Nombres de filtros aceptados desde la URL (p. ej. `categoryId`). */
  filters?: readonly string[];
  default_sort?: GridQuery['sort'];
  default_size?: number;
}

/**
 * Convierte los `searchParams` de la página en una consulta saneada.
 * En la URL `page` es base 1; aquí se pasa a base 0. Valores fuera de rango
 * o campos de orden no permitidos se ignoran en vez de romper la página.
 */
export function parse_grid_query(params: SearchParams, options: ParseGridQueryOptions): GridQuery {
  const page_param = Number(first(params.page));
  const size_param = Number(first(params.size));
  const sort = sortFromParam(first(params.sort));

  const filters: Record<string, string> = {};
  for (const key of options.filters ?? []) {
    const value = first(params[key]);
    if (value) filters[key] = value;
  }

  return {
    q: (first(params.q) ?? '').trim().slice(0, 120),
    page: Number.isInteger(page_param) && page_param > 0 ? page_param - 1 : 0,
    size: (PAGE_SIZE_OPTIONS as readonly number[]).includes(size_param)
      ? size_param
      : (options.default_size ?? DEFAULT_PAGE_SIZE),
    sort: sort && options.sortable.includes(sort.field) ? sort : (options.default_sort ?? null),
    filters,
  };
}

/** Query string para `GET …/search` del backend. */
export function to_search_params(query: GridQuery, overrides: Partial<{ page: number; size: number }> = {}) {
  const search = new URLSearchParams();
  if (query.q) search.set('q', query.q);
  search.set('page', String(overrides.page ?? query.page));
  search.set('size', String(overrides.size ?? query.size));
  const sort = sortToParam(query.sort);
  if (sort) search.set('sort', sort);
  for (const [key, value] of Object.entries(query.filters)) {
    if (value) search.set(key, value);
  }
  return search.toString();
}

/**
 * Normaliza la respuesta paginada del backend. Acepta el `PageResponse`
 * propio ({content, page, size, total_elements, total_pages}), el `Page` de
 * Spring ({content, number, …}) y su variante `VIA_DTO` ({content, page:{…}}).
 */
export function to_page_result<T>(response: unknown, fallback_size: number): PageResult<T> {
  const body = (response ?? {}) as Record<string, any>;
  const items: T[] = Array.isArray(body) ? body : Array.isArray(body.content) ? body.content : [];
  const meta = typeof body.page === 'object' && body.page !== null ? body.page : body;
  const size = Number(meta.size ?? fallback_size) || fallback_size;
  const page = Number(typeof body.page === 'number' ? body.page : (meta.number ?? 0)) || 0;
  const total = Number(meta.total_elements ?? items.length) || 0;
  const total_pages = Number(meta.total_pages ?? Math.ceil(total / size)) || 0;
  return { items, page, size, total, totalPages: total_pages };
}

/** ¿El backend aún no tiene el endpoint? (versión anterior desplegada). */
export function is_missing_endpoint(error: unknown): boolean {
  return error instanceof ServerApiError && (error.status === 404 || error.status === 405);
}

export interface InMemoryOptions<T> {
  /** Textos de cada registro donde buscar `q`. */
  search_fields: (item: T) => Array<string | number | null | undefined>;
  /** Filtros exactos por campo (valor de la URL comparado como string). */
  filter_fields?: Record<string, (item: T) => string | number | null | undefined>;
}

/**
 * Paginación, búsqueda y orden en memoria. Respaldo cuando el backend
 * todavía no expone `/search` (p. ej. no se ha recompilado): la pantalla
 * sigue funcionando igual, solo que filtrando en el servidor de Next.
 */
export function paginate_in_memory<T extends object>(
  items: T[],
  query: GridQuery,
  options: InMemoryOptions<T>,
): PageResult<T> {
  const needle = query.q.toLocaleLowerCase('es');
  let rows = items.filter((item) => {
    if (needle) {
      const haystack = options.search_fields(item).filter((value) => value != null).join(' ').toLocaleLowerCase('es');
      if (!haystack.includes(needle)) return false;
    }
    for (const [key, value] of Object.entries(query.filters)) {
      const accessor = options.filter_fields?.[key];
      if (accessor && value && String(accessor(item) ?? '') !== value) return false;
    }
    return true;
  });

  if (query.sort) {
    const { field, direction } = query.sort;
    const factor = direction === 'desc' ? -1 : 1;
    rows = [...rows].sort((a, b) => {
      const left = (a as Record<string, unknown>)[field];
      const right = (b as Record<string, unknown>)[field];
      if (left == null && right == null) return 0;
      if (left == null) return 1;
      if (right == null) return -1;
      if (typeof left === 'number' && typeof right === 'number') return (left - right) * factor;
      return String(left).localeCompare(String(right), 'es', { sensitivity: 'base', numeric: true }) * factor;
    });
  }

  const total = rows.length;
  const total_pages = Math.max(1, Math.ceil(total / query.size));
  const page = Math.min(query.page, total_pages - 1);
  return {
    items: rows.slice(page * query.size, page * query.size + query.size),
    page,
    size: query.size,
    total,
    totalPages: total_pages,
  };
}

/** Recorre todas las páginas (para exportar). Corta en `max` registros. */
export async function collect_all_pages<T>(
  fetch_page: (page: number, size: number) => Promise<PageResult<T>>,
  max = 10_000,
  size = 200,
): Promise<{ items: T[]; truncated: boolean }> {
  const items: T[] = [];
  let page = 0;
  for (;;) {
    const result = await fetch_page(page, size);
    items.push(...result.items);
    if (items.length >= max) return { items: items.slice(0, max), truncated: true };
    page += 1;
    if (page >= result.totalPages || result.items.length === 0) return { items, truncated: false };
  }
}

/**
 * Extrae `field_errors` del cuerpo de error uniforme del backend. Los nombres
 * de campo llegan en snake_case, igual que los campos de los formularios.
 */
export function field_errors_from(error: unknown): Record<string, string> | undefined {
  if (!(error instanceof ServerApiError)) return undefined;
  const list = (error.details as { field_errors?: Array<{ field: string; message: string }> } | undefined)?.field_errors;
  if (!Array.isArray(list) || list.length === 0) return undefined;
  return Object.fromEntries(list.map((item) => [item.field, item.message]));
}
