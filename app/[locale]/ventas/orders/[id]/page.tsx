/** @format */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { get_order_by_id, get_order_reservations } from "@/server/domains/sales/orders/queries";
import { list_product_orders } from "@/server/domains/sales/product-orders/queries";
import { list_all_warehouses } from "@/server/domains/inventory/warehouses/queries";
import { ServerApiError } from "@/server/lib/types";
import { OrderDetail } from "@/modules/ventas/order";

type Params = Promise<{ locale: string; id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "Administre.order" });
  return { title: t("orderLabel", { id }) };
}

const OrderDetailPage = async ({ params }: { params: Params }) => {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) notFound();

  const order = await get_order_by_id({ id: orderId }).catch((error: unknown) => {
    if (error instanceof ServerApiError && error.is_not_found) notFound();
    throw error;
  });

  // Las líneas eligen el SKU con el buscador asíncrono (/catalog/skus/lookup): ya no se cargan productos aquí.
  const [items, reservations, warehouses] = await Promise.all([
    list_product_orders(),
    get_order_reservations({ id: orderId }).catch(() => []),
    list_all_warehouses(),
  ]);

  return (
    <OrderDetail
      order={order}
      items={items.filter((item) => item.order_id === orderId)}
      reservations={reservations}
      warehouses={warehouses.map(({ id: warehouseId, name }) => ({ id: warehouseId, name }))}
    />
  );
};

export default OrderDetailPage;
