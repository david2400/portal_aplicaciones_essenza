import 'server-only';

import { cache } from 'react';

import { product_orders_repository } from './repository';

export const list_product_orders = cache(async () => {
  return product_orders_repository.list_product_orders();
});
