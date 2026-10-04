/** @format */

import type { IOrder } from "./models/order.interface";

export interface OrderStats {
  total: number;
  revenue: number;
  pending: number;
  averageTicket: number;
}

/** KPIs de ventas (sobre todas las órdenes; las canceladas no suman ingresos). */
export const buildOrderStats = (orders: IOrder[]): OrderStats => {
  const valid = orders.filter((order) => order.state !== "CANCELLED");
  const revenue = valid.reduce((acc, order) => acc + (order.total ?? 0), 0);
  return {
    total: orders.length,
    revenue,
    pending: orders.filter((order) => order.state === "PENDING").length,
    averageTicket: valid.length ? revenue / valid.length : 0,
  };
};
