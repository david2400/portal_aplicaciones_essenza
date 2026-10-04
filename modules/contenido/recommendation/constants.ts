/** @format */

/** Valores documentados en `ProductRecommendationDto`. */
export const RECOMMENDATION_TYPES = [
  "COLLABORATIVE",
  "CONTENT_BASED",
  "TRENDING",
  "CROSS_SELL",
  "UP_SELL",
] as const;

export const RECOMMENDATION_CONTEXTS = ["HOME", "PRODUCT_PAGE", "CART", "CHECKOUT"] as const;

const moneyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export const formatMoney = (value?: number) => (value == null ? "—" : moneyFormatter.format(value));

export const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
