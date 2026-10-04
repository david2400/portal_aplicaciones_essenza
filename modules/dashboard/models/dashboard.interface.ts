/** @format */

import type {
  SalesAnalyticsDto,
  SalesPerformanceKpiDto,
  SalesConversionFunnelDto,
} from "@/server/domains/analytics/sales-analytics/types";

export type ISalesReport = SalesAnalyticsDto;
export type ISalesKpis = SalesPerformanceKpiDto;
export type ISalesFunnel = SalesConversionFunnelDto;

/** Cada bloque llega por separado: si un endpoint falla, el resto se muestra. */
export interface IDashboardData {
  rangeDays: number;
  report: ISalesReport | null;
  kpis: ISalesKpis | null;
  trends: ISalesReport[] | null;
  funnel: ISalesFunnel | null;
  pendingOrders: number | null;
  lowStock: { id?: number; name?: string; stock?: number }[] | null;
}

export const DASHBOARD_RANGES = [7, 30, 90] as const;
