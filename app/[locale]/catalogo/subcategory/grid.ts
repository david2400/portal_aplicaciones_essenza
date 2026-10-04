import type { ParseGridQueryOptions } from '@/server/lib/pagination';

/** Campos ordenables, filtros de URL y orden por defecto (igual que el backend). */
export const SUBCATEGORY_GRID: ParseGridQueryOptions = {
  sortable: ['name', 'slug', 'createdAt', 'updatedAt', 'categoryId'],
  filters: ['categoryId'],
  default_sort: { field: 'name', direction: 'asc' },
};
