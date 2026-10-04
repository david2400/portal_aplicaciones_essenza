/** @format */

import type {
  CouponDto,
  CreateCouponDto,
  UpdateCouponDto,
} from "@/server/domains/promotions/coupons/types";

export type ICoupon = CouponDto;
export type ICouponCreateRequest = CreateCouponDto;
export type ICouponUpdateRequest = UpdateCouponDto;

export const DISCOUNT_TYPES = ["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

export type INamedItem = { id?: number; name?: string };

/** Vigencia calculada a partir de `isActive`, fechas y usos. */
export type CouponStatus = "active" | "scheduled" | "expired" | "exhausted" | "inactive";
