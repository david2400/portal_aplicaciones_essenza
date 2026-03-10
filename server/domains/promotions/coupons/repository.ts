import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { coupons_tags } from '@/server/lib/cache-tags';
import type {
  CouponDto,
  CreateCouponDto,
  UpdateCouponPayload,
  ValidateCouponParams,
  CalculateCouponDiscountParams,
} from './types';

const coupons_base_path = '/api/shop/promotions/coupons';
const coupon_by_id_path = (id: number) => `${coupons_base_path}/${id}`;
const coupon_validate_path = `${coupons_base_path}/validate`;
const coupon_calculate_path = `${coupons_base_path}/calculate-discount`;

function build_coupon_query(params: ValidateCouponParams): string {
  const query = new URLSearchParams();
  query.set('code', params.code);
  query.set('orderAmount', String(params.order_amount));

  params.product_ids?.forEach((id) => {
    query.append('productIds', String(id));
  });

  params.category_ids?.forEach((id) => {
    query.append('categoryIds', String(id));
  });

  const query_string = query.toString();
  return query_string ? `?${query_string}` : '';
}

export const coupons_repository = {
  async list_coupons(): Promise<CouponDto[]> {
    return server_fetch.get<CouponDto[]>(coupons_base_path, {
      revalidate: 60,
      tags: [coupons_tags.list()],
    });
  },

  async get_coupon_by_id(id: number): Promise<CouponDto> {
    return server_fetch.get<CouponDto>(coupon_by_id_path(id), {
      revalidate: 60,
      tags: [coupons_tags.coupon(id)],
    });
  },

  async create_coupon(payload: CreateCouponDto): Promise<CouponDto> {
    return server_fetch.post<CouponDto>(coupons_base_path, payload, {
      revalidate: false,
    });
  },

  async update_coupon(payload: UpdateCouponPayload): Promise<CouponDto> {
    return server_fetch.put<CouponDto>(coupon_by_id_path(payload.id), payload, {
      revalidate: false,
    });
  },

  async delete_coupon(id: number): Promise<void> {
    return server_fetch.delete<void>(coupon_by_id_path(id), {
      revalidate: false,
    });
  },

  async validate_coupon(params: ValidateCouponParams): Promise<CouponDto> {
    const query = build_coupon_query(params);
    return server_fetch.post<CouponDto>(`${coupon_validate_path}${query}`, undefined, {
      revalidate: false,
      tags: [coupons_tags.validation(params.code)],
    });
  },

  async calculate_coupon_discount(params: CalculateCouponDiscountParams): Promise<number> {
    const query = build_coupon_query(params);
    return server_fetch.post<number>(`${coupon_calculate_path}${query}`, undefined, {
      revalidate: false,
      tags: [coupons_tags.calculation(params.code)],
    });
  },
} as const;
