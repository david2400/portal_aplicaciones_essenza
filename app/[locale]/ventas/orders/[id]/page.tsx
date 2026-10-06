/** @format */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { get_order_by_id, get_order_reservations } from "@/server/domains/sales/orders/queries";
import { list_product_orders } from "@/server/domains/sales/product-orders/queries";
import { list_products } from "@/server/domains/inventory/products/queries";
import { list_all_warehouses } from "@/server/domains/inventory/warehouses/queries";
import { ServerApiError } from "@/server/lib/types";
import { OrderDetail, type IOrderSku } from "@/modules/ventas/order";

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

  const [items, products, reservations, warehouses] = await Promise.all([
    list_product_orders(),
    list_products({ size: 500 }),
    get_order_reservations({ id: orderId }).catch(() => []),
    list_all_warehouses(),
  ]);

  // SKU a la venta: productos publicados y SKU activos (variantes, o el SKU por defecto si no tiene).
  const skus: IOrderSku[] = products
    .filter((product) => product.status === "ACTIVE")
    .flatMap((product) => {
      const active = (product.skus ?? []).filter((sku) => sku.id != null && sku.active !== false);
      const variants = active.filter((sku) => sku.variant_id != null);
      const sellable = variants.length > 0 ? variants : active.filter((sku) => sku.is_default).slice(0, 1);
      return sellable.map((sku) => ({
        id: sku.id as number,
        product_id: product.id,
        code: sku.code,
        unit_price: sku.price,
        label: [product.name, variants.length > 0 ? sku.name : null, sku.code].filter(Boolean).join(" · "),
      }));
    });

  return (
    <OrderDetail
      order={order}
      items={items.filter((item) => item.order_id === orderId)}
      skus={skus}
      reservations={reservations}
      warehouses={warehouses.map(({ id: warehouseId, name }) => ({ id: warehouseId, name }))}
    />
  );
};

export default OrderDetailPage;
