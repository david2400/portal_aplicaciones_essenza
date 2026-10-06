import type { ParseGridQueryOptions } from '@/server/lib/pagination';

/** Campos ordenables y filtros de URL del listado de productos. */
export const PRODUCT_GRID: ParseGridQueryOptions = {
  sortable: ['name', 'unitPrice', 'realPrice', 'stock', 'status', 'createdAt', 'updatedAt'],
  filters: ['brandId', 'categoryId', 'subcategoryId', 'available', 'status'],
  default_sort: { field: 'name', direction: 'asc' },
};
