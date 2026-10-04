import type { ParseGridQueryOptions } from '@/server/lib/pagination';

/** Campos ordenables y orden por defecto (igual que la lista blanca del backend). */
export const CATEGORY_GRID: ParseGridQueryOptions = {
  sortable: ['name', 'slug', 'createdAt', 'updatedAt'],
  default_sort: { field: 'name', direction: 'asc' },
};
