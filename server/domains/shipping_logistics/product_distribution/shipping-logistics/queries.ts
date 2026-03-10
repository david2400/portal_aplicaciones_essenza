import 'server-only';

import { cache } from 'react';

import { shipping_logistics_repository } from './repository';
import type { ShippingEstimateQuery } from './types';

export const list_trackings = cache(async () => {
  return shipping_logistics_repository.list_trackings();
});

export const get_tracking_by_id = cache(async ({ id }: { id: number }) => {
  return shipping_logistics_repository.get_tracking_by_id(id);
});

export const list_dispatch_details = cache(async () => {
  return shipping_logistics_repository.list_dispatch_details();
});

export const get_dispatch_detail_by_id = cache(async ({ id }: { id: number }) => {
  return shipping_logistics_repository.get_dispatch_detail_by_id(id);
});

export const get_shipping_estimate = cache(async (query: ShippingEstimateQuery) => {
  return shipping_logistics_repository.get_shipping_estimate(query);
});

export const get_dispatch_product_shipping_estimate = cache(
  async (query: ShippingEstimateQuery) => {
    return shipping_logistics_repository.get_dispatch_product_shipping_estimate(query);
  },
);
