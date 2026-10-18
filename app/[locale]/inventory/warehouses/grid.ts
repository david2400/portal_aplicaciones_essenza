import type { ParseGridQueryOptions } from '@/server/lib/pagination';

/** Campos ordenables y filtros de URL del listado de bodegas (igual que el backend). */
export const WAREHOUSE_GRID: ParseGridQueryOptions = {
  sortable: ['id', 'code', 'name', 'warehouseType', 'city', 'active', 'fulfillmentPriority', 'createdAt', 'updatedAt'],
  filters: ['warehouseType', 'active', 'cityId'],
  default_sort: null,
};
