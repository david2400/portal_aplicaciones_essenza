/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_orders } from "@/server/domains/sales/orders/queries";
import { list_product_orders } from "@/server/domains/sales/product-orders/queries";
import { search_orders } from "@/server/domains/sales/orders/search";
import { parse_grid_query } from "@/server/lib/pagination";
import { buildOrderStats } from "@/modules/ventas/order/stats";
import { ORDER_GRID } from "./grid";
import { OrderManager } from "@/modules/ventas/order";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.order" });

  return { title: t("order"), description: tModule("description") };
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const OrdersPage = async ({ searchParams }: { searchParams: SearchParams }) => {
  const query = parse_grid_query(await searchParams, ORDER_GRID);
  const [page, all, items] = await Promise.all([search_orders(query), list_orders(), list_product_orders()]);

  return <OrderManager page={page} stats={buildOrderStats(all)} items={items} />;
};

export default OrdersPage;
