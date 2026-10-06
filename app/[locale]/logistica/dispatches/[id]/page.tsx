/** @format */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { get_dispatch_product_by_id } from "@/server/domains/shipping_logistics/dispatch/dispatch-products/queries";
import {
  list_dispatch_details,
  list_trackings,
} from "@/server/domains/shipping_logistics/product_distribution/shipping-logistics/queries";
import { list_carriers } from "@/server/domains/shipping_logistics/product_distribution/carriers/queries";
import { list_orders } from "@/server/domains/sales/orders/queries";
import { list_product_orders } from "@/server/domains/sales/product-orders/queries";
import { list_products } from "@/server/domains/inventory/products/queries";
import { ServerApiError } from "@/server/lib/types";
import { DispatchDetail } from "@/modules/logistica/dispatch";

type Params = Promise<{ locale: string; id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "Administre.dispatch" });
  return { title: t("dispatchLabel", { guide: `#${id}` }) };
}

const DispatchDetailPage = async ({ params }: { params: Params }) => {
  const { id } = await params;
  const dispatchId = Number(id);
  if (!Number.isInteger(dispatchId) || dispatchId <= 0) notFound();

  const dispatch = await get_dispatch_product_by_id({ id: dispatchId }).catch((error: unknown) => {
    if (error instanceof ServerApiError && error.is_not_found) notFound();
    throw error;
  });

  const [lines, trackings, carriers, orders, productOrders, products] = await Promise.all([
    list_dispatch_details(),
    list_trackings(),
    list_carriers(),
    list_orders(),
    list_product_orders(),
    list_products({ size: 500 }),
  ]);

  const productNames = new Map(products.map((product) => [product.id, product.name]));

  return (
    <DispatchDetail
      dispatch={dispatch}
      lines={lines.filter((line) => line.dispatch_product_id === dispatchId)}
      trackings={trackings.filter((tracking) => tracking.dispatch_product_id === dispatchId)}
      orderLines={productOrders
        .filter((item) => item.order_id === dispatch.order_id)
        .map((item) => ({
          id: item.id,
          product_name: productNames.get(item.product_id) ?? `#${item.product_id}`,
          quantity: item.quantity ?? 0,
        }))}
      carriers={carriers
        .filter((carrier) => carrier.is_active !== false)
        .map(({ id, name, code }) => ({ id, name, code }))}
      orders={orders.map((order) => ({
        id: order.id,
        name: `#${order.id}${order.state ? ` · ${order.state}` : ""}`,
      }))}
    />
  );
};

export default DispatchDetailPage;
