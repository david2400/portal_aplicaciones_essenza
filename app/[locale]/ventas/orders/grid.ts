import type { ParseGridQueryOptions } from '@/server/lib/pagination';

/** Campos ordenables y filtros de URL del listado de órdenes (igual que el backend). */
export const ORDER_GRID: ParseGridQueryOptions = {
  sortable: ['id', 'total', 'state', 'createdAt', 'updatedAt'],
  filters: ['state'],
  default_sort: { field: 'id', direction: 'desc' },
};
