import 'server-only';

import { cache } from 'react';

import { warehouses_repository } from './repository';
import type { ListWarehousesParams, WarehouseDto } from './types';
import { to_list } from '@/server/lib/list-response';

export const list_warehouses = cache(async (params?: ListWarehousesParams) => {
  return warehouses_repository.list_warehouses(params);
});

/** Lista plana de bodegas (el endpoint devuelve una página de Spring). */
export const list_all_warehouses = cache(async () => {
  const page = await warehouses_repository.list_warehouses({ page: 0, size: 500 } as ListWarehousesParams);
  return to_list<WarehouseDto>(page);
});
