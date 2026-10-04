/** @format */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { get_order_by_id } from "@/server/domains/sales/orders/queries";
import { list_product_orders } from "@/server/domains/sales/product-orders/queries";
import { list_products } from "@/server/domains/inventory/products/queries";
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

  const [items, products] = await Promise.all([
    list_product_orders(),
    list_products({ size: 500 }),
  ]);

  return (
    <OrderDetail
      order={order}
      items={items.filter((item) => item.orderId === orderId)}
      products={products.map((product) => ({
        id: product.id,
        name: product.name,
        unitPrice: product.unitPrice,
      }))}
    />
  );
};

export default OrderDetailPage;
