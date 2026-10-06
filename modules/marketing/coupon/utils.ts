/** @format */

import type { CouponStatus, ICoupon } from "./models/coupon.interface";

const money = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
export const formatMoney = (value?: number | null) => (value == null ? "—" : money.format(value));

/** El backend guarda las listas de IDs como texto separado por comas. */
export const csvToList = (value?: string | null) =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const listToCsv = (values?: string[]) => (values && values.length ? values.join(",") : undefined);

/** LocalDateTime de Spring ⇄ `<input type="datetime-local">`. */
export const toInputDateTime = (value?: string | null) => (value ? value.slice(0, 16) : "");
export const fromInputDateTime = (value: string) => (value.length === 16 ? `${value}:00` : value);

export const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
};

export const couponStatus = (coupon: ICoupon, now = new Date()): CouponStatus => {
  if (!coupon.is_active) return "inactive";
  if (coupon.usage_limit != null && (coupon.usage_count ?? 0) >= coupon.usage_limit) return "exhausted";
  if (coupon.valid_from && new Date(coupon.valid_from) > now) return "scheduled";
  if (coupon.valid_until && new Date(coupon.valid_until) < now) return "expired";
  return "active";
};
