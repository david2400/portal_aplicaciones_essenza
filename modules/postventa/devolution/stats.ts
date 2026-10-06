/** @format */

import type { IDevolution } from "./models/devolution.interface";

export interface DevolutionStats {
  total: number;
  pending: number;
  inProgress: number;
  refunded: number;
}

const IN_PROGRESS = ["A", "R", "I"];

/** KPIs de postventa sobre todas las devoluciones. */
export const buildDevolutionStats = (items: IDevolution[]): DevolutionStats => ({
  total: items.length,
  pending: items.filter((item) => (item.state ?? "P") === "P").length,
  inProgress: items.filter((item) => IN_PROGRESS.includes(item.state ?? "")).length,
  refunded: items.filter((item) => item.state === "F").reduce((acc, item) => acc + (item.total_refund_amount ?? 0), 0),
});
