import 'server-only';

import { cache } from 'react';

import { dispatch_products_repository } from './repository';
import type { DispatchProductShippingEstimateQuery } from './types';

export const list_dispatch_products = cache(async () => {
  return dispatch_products_repository.list_dispatch_products();
});

export const get_dispatch_product_by_id = cache(async ({ id }: { id: number }) => {
  return dispatch_products_repository.get_dispatch_product_by_id(id);
});

export const fetch_dispatch_product_shipping_estimate = cache(
  async (query: DispatchProductShippingEstimateQuery) => {
    return dispatch_products_repository.fetch_dispatch_product_shipping_estimate(query);
  },
);
