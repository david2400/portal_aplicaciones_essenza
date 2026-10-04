import type { ParseGridQueryOptions } from '@/server/lib/pagination';

/** Campos ordenables y filtros de URL del listado de despachos (igual que el backend). */
export const DISPATCH_GRID: ParseGridQueryOptions = {
  sortable: ['id', 'guideNumber', 'estimatedDeliveryDate', 'realDeliveryDate', 'orderId', 'cityDestination', 'createdAt'],
  filters: ['orderId', 'cityDestination'],
  default_sort: { field: 'id', direction: 'desc' },
};
