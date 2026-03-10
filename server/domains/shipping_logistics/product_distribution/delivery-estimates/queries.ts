import 'server-only';

import { cache } from 'react';

import { delivery_estimates_repository } from './repository';

export const list_delivery_estimates = cache(async () => {
  return delivery_estimates_repository.list_delivery_estimates();
});

export const get_delivery_estimate_by_id = cache(async ({ id }: { id: number }) => {
  return delivery_estimates_repository.get_delivery_estimate_by_id(id);
});
