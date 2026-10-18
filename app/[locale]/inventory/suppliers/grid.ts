import type { ParseGridQueryOptions } from '@/server/lib/pagination';

/** Campos ordenables y filtros de URL del listado de proveedores (igual que el backend). */
export const SUPPLIER_GRID: ParseGridQueryOptions = {
  sortable: ['id', 'code', 'name', 'tradeName', 'status', 'city', 'paymentTermDays', 'createdAt', 'updatedAt'],
  filters: ['status', 'cityId'],
  default_sort: { field: 'name', direction: 'asc' },
};
