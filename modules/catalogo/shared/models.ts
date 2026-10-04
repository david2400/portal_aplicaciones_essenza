/** @format */

import type { ActionResult, BulkResult } from "@/shared/models/pagination";

/** Forma común de marcas, categorías y subcategorías. */
export interface TaxonomyItem {
  id?: number;
  name?: string;
  slug?: string;
  description?: string;
  categoryId?: number;
  createdAt?: string;
  updatedAt?: string;
}

/** Indicadores calculados en el servidor para el encabezado. */
export interface TaxonomyStats {
  total: number;
  withoutDescription: number;
  recent: number;
}

export interface TaxonomyFormValues {
  name: string;
  slug?: string;
  description?: string;
  categoryId?: number;
}

/** Server actions que el gestor necesita de cada recurso. */
export interface TaxonomyActions<T> {
  create: (values: TaxonomyFormValues) => Promise<ActionResult<{ id?: number }>>;
  update: (id: number, values: TaxonomyFormValues) => Promise<ActionResult>;
  remove: (id: number) => Promise<ActionResult>;
  bulkRemove: (ids: number[]) => Promise<ActionResult<BulkResult>>;
  exportAll: (params: Record<string, string>) => Promise<ActionResult<{ items: T[]; truncated: boolean }>>;
}
