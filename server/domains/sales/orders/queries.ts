import 'server-only';

import { cache } from 'react';

import { orders_repository } from './repository';

export const list_orders = cache(async () => {
  return orders_repository.list_orders();
});

export const get_order_by_id = cache(async ({ id }: { id: number }) => {
  return orders_repository.get_order_by_id(id);
});
