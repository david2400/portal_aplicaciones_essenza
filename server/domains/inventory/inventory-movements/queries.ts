import 'server-only';

import { cache } from 'react';

import { inventory_movements_repository } from './repository';

export const list_inventory_movements = cache(async (params?: { page?: number; size?: number }) => {
  return inventory_movements_repository.list_inventory_movements(params);
});
