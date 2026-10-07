/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Dashboard } from "@/modules/dashboard/components/dashboard";
import { DASHBOARD_RANGES, type IDashboardData } from "@/modules/dashboard/models/dashboard.interface";
import {
  get_sales_report,
  get_sales_kpis,
  get_sales_trends,
  get_sales_funnel,
} from "@/server/domains/analytics/sales-analytics/queries";
import { list_orders } from "@/server/domains/sales/orders/queries";
import { get_product_stats } from "@/server/domains/inventory/products/queries";

const LOW_STOCK_THRESHOLD = 5;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Dashboard" });
  return { title: t("title") };
}

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

/** Devuelve el valor o `null` si el endpoint falla: un bloque caído no tumba el panel. */
const settled = <T,>(result: PromiseSettledResult<T>): T | null =>
  result.status === "fulfilled" ? result.value : null;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const parsed = Number(range);
  const rangeDays = (DASHBOARD_RANGES as readonly number[]).includes(parsed) ? parsed : 30;

  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - rangeDays);
  const query = { start_date: isoDate(start), end_date: isoDate(end) };

  const [report, kpis, trends, funnel, orders, products] = await Promise.allSettled([
    get_sales_report({ ...query, period: "DAILY" }),
    get_sales_kpis(query),
    get_sales_trends({ ...query, period: rangeDays > 30 ? "WEEKLY" : "DAILY" }),
    get_sales_funnel(query),
    list_orders(),
    get_product_stats({ low_stock_threshold: LOW_STOCK_THRESHOLD, low_stock_limit: 8 }),
  ]);

  const orderList = settled(orders);
  const productStats = settled(products);

  const data: IDashboardData = {
    rangeDays,
    report: settled(report),
    kpis: settled(kpis),
    trends: settled(trends),
    funnel: settled(funnel),
    pendingOrders: orderList ? orderList.filter((order) => order.state === "PENDING").length : null,
    // El backend devuelve ya ordenados los productos con menos stock (≤ umbral).
    lowStock: productStats ? (productStats.low_stock_items ?? []).map(({ id, name, stock }) => ({ id, name, stock })) : null,
  };

  return <Dashboard data={data} />;
}
