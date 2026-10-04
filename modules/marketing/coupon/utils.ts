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
  if (!coupon.isActive) return "inactive";
  if (coupon.usageLimit != null && (coupon.usageCount ?? 0) >= coupon.usageLimit) return "exhausted";
  if (coupon.validFrom && new Date(coupon.validFrom) > now) return "scheduled";
  if (coupon.validUntil && new Date(coupon.validUntil) < now) return "expired";
  return "active";
};
