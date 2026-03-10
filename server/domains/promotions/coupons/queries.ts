import 'server-only';

import { cache } from 'react';

import { coupons_repository } from './repository';

export const list_coupons = cache(async () => {
  return coupons_repository.list_coupons();
});

export const get_coupon_by_id = cache(async ({ id }: { id: number }) => {
  return coupons_repository.get_coupon_by_id(id);
});
