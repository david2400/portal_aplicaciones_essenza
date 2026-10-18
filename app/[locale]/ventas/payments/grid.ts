import type { ParseGridQueryOptions } from '@/server/lib/pagination';

/** Campos ordenables y filtros de URL del listado de pagos (igual que el backend). */
export const PAYMENT_GRID: ParseGridQueryOptions = {
  sortable: ['id', 'amount', 'status', 'createdAt', 'approvedAt', 'orderId'],
  filters: ['status', 'methodId', 'channel', 'provider', 'orderId', 'from', 'to'],
  default_sort: { field: 'id', direction: 'desc' },
};
