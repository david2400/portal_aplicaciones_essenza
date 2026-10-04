import type { ParseGridQueryOptions } from '@/server/lib/pagination';

/** Campos ordenables y filtros de URL del listado de productos. */
export const PRODUCT_GRID: ParseGridQueryOptions = {
  sortable: ['name', 'unitPrice', 'realPrice', 'stock', 'createdAt', 'updatedAt'],
  filters: ['brandId', 'categoryId', 'subcategoryId', 'available'],
  default_sort: { field: 'name', direction: 'asc' },
};
