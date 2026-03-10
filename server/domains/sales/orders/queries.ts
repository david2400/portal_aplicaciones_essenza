import 'server-only';

import { cache } from 'react';

import { orders_repository } from './repository';

export const list_orders = cache(async () => {
  return orders_repository.list_orders();
});
