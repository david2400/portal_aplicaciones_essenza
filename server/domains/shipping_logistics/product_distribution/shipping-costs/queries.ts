import 'server-only';

import { cache } from 'react';

import { shipping_costs_repository } from './repository';

export const list_shipping_costs = cache(async () => {
  return shipping_costs_repository.list_shipping_costs();
});

export const get_shipping_cost_by_id = cache(async ({ id }: { id: number }) => {
  return shipping_costs_repository.get_shipping_cost_by_id(id);
});
