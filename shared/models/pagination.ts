/** @format */

/**
 * Tipos compartidos (cliente y servidor) para listados paginados, acciones
 * en lote y resultados de server actions. Sin dependencias de servidor:
 * se pueden importar desde componentes cliente.
 */

/** Página de resultados normalizada (índice de página base 0). */
export interface PageResult<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

/** Dirección de orden. */
export type SortDirection = "asc" | "desc";

export interface SortState {
  field: string;
  direction: SortDirection;
}

/**
 * Consulta de un listado tal como viaja entre la URL, el servidor y el API.
 * `page` es base 0 (en la URL se muestra base 1 para humanos).
 */
export interface GridQuery {
  q: string;
  page: number;
  size: number;
  sort: SortState | null;
  filters: Record<string, string>;
}

/** Resultado de una operación en lote (espejo de `BulkOperationResult`). */
export interface BulkResult {
  requested: number;
  succeeded: number;
  failed: Array<{ id: number; reason: string }>;
}

/** Resultado de una server action: nunca lanza, devuelve el error. */
export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 20;

/** Serializa el orden al formato del API: `campo,asc`. */
export const sortToParam = (sort: SortState | null) =>
  sort ? `${sort.field},${sort.direction}` : "";

/** Lee `campo,asc|desc` de la URL. */
export const sortFromParam = (value: string | null | undefined): SortState | null => {
  if (!value) return null;
  const [field, direction] = value.split(",");
  if (!field) return null;
  return { field, direction: direction === "desc" ? "desc" : "asc" };
};
