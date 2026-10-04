import type { ParseGridQueryOptions } from '@/server/lib/pagination';

/** Campos ordenables y filtros de URL del listado de devoluciones (igual que el backend). */
export const DEVOLUTION_GRID: ParseGridQueryOptions = {
  sortable: ['id', 'state', 'orderId', 'totalRefundAmount', 'createdAt', 'updatedAt'],
  filters: ['state', 'motiveDevolutionId', 'orderId'],
  default_sort: { field: 'id', direction: 'desc' },
};
