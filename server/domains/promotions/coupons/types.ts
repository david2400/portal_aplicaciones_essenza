import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type CouponDto = components['schemas']['CouponDto'];
export type CreateCouponDto = components['schemas']['CreateCouponDto'];
export type UpdateCouponDto = components['schemas']['UpdateCouponDto'];

export type UpdateCouponPayload = UpdateCouponDto & { id: number };

export type ValidateCouponParams = {
  code: string;
  order_amount: number;
  product_ids?: number[];
  category_ids?: number[];
};

export type CalculateCouponDiscountParams = ValidateCouponParams;
