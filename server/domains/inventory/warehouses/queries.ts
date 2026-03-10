import 'server-only';

import { cache } from 'react';

import { warehouses_repository } from './repository';
import type { ListWarehousesParams } from './types';

export const list_warehouses = cache(async (params?: ListWarehousesParams) => {
  return warehouses_repository.list_warehouses(params);
});
