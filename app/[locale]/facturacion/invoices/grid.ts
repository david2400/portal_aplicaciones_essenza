import type { ParseGridQueryOptions } from '@/server/lib/pagination';

/** Campos ordenables y filtros de URL del listado de facturas (igual que el backend). */
export const INVOICE_GRID: ParseGridQueryOptions = {
  sortable: ['id', 'number', 'issuedAt', 'total', 'status', 'orderId'],
  filters: ['kind', 'status', 'orderId', 'from', 'to'],
  default_sort: { field: 'id', direction: 'desc' },
};
