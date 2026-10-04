/** @format */

/**
 * Estados de una orden.
 *
 * El backend guarda `state` como texto libre (`@NotBlank String`), así que
 * la lista vive aquí. Un valor desconocido se muestra tal cual.
 */
export const ORDER_STATES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderState = (typeof ORDER_STATES)[number];

export const ORDER_STATE_VARIANT: Record<
  OrderState,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "outline",
  PAID: "secondary",
  PROCESSING: "secondary",
  SHIPPED: "default",
  DELIVERED: "default",
  CANCELLED: "destructive",
};

export const isOrderState = (value?: string): value is OrderState =>
  !!value && (ORDER_STATES as readonly string[]).includes(value);

const moneyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export const formatMoney = (value?: number) =>
  value == null ? "—" : moneyFormatter.format(value);
