/** @format */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { get_order_by_id, get_order_reservations, get_order_timeline } from "@/server/domains/sales/orders/queries";
import { list_carriers } from "@/server/domains/shipping_logistics/product_distribution/carriers/queries";
import { list_product_orders } from "@/server/domains/sales/product-orders/queries";
import { list_all_warehouses } from "@/server/domains/inventory/warehouses/queries";
import { get_order_payments } from "@/server/domains/sales/payments/queries";
import { list_payment_methods } from "@/server/domains/sales/payment-methods/queries";
import { ServerApiError } from "@/server/lib/types";
import { OrderDetail } from "@/modules/ventas/order";
import { OrderPayments } from "@/modules/ventas/payment";
import { get_order_invoices } from "@/server/domains/billing/invoices/queries";
import { get_billing_settings } from "@/server/domains/billing/settings/queries";
import { OrderInvoices } from "@/modules/facturacion/invoice";
import { list_order_devolutions } from "@/server/domains/devolution/order-devolutions/queries";
import { OrderReturns } from "@/modules/postventa/devolution";
import { load_devolution_catalogs } from "../../../postventa/devolutions/catalogs";

type Params = Promise<{ locale: string; id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "Administre.order" });
  const order = await get_order_by_id({ id: Number(id) }).catch(() => null);
  return { title: order?.order_number ?? t("orderLabel", { id }) };
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
  // Los pagos son un bloque aparte: si su API falla, el detalle funciona igual.
  const [items, reservations, warehouses, payments, methods, invoices, billing, devolutions, returnCatalogs, events, carriers] = await Promise.all([
    list_product_orders(),
    get_order_reservations({ id: orderId }).catch(() => []),
    list_all_warehouses(),
    get_order_payments({ order_id: orderId }).catch(() => null),
    list_payment_methods(false).catch(() => []),
    get_order_invoices({ order_id: orderId }).catch(() => null),
    get_billing_settings().catch(() => null),
    list_order_devolutions().catch(() => []),
    load_devolution_catalogs().catch(() => ({ motives: [], returnMethods: [], refundMethods: [] })),
    get_order_timeline(orderId).catch(() => []),
    list_carriers().catch(() => []),
  ]);

  return (
    <OrderDetail
      order={order}
      items={items.filter((item) => item.order_id === orderId)}
      reservations={reservations}
      warehouses={warehouses.map(({ id: warehouseId, name }) => ({ id: warehouseId, name }))}
      carriers={carriers.filter((carrier) => carrier.is_active !== false).map(({ id: carrierId, name }) => ({ id: carrierId, name }))}
      events={events}
      payments={<OrderPayments data={payments} methods={methods} />}
      invoices={
        <OrderInvoices
          orderId={orderId}
          orderState={order.state}
          orderTotal={order.total}
          invoices={invoices}
          settings={billing}
        />
      }
      returns={
        <OrderReturns
          orderId={orderId}
          orderState={order.state}
          devolutions={devolutions.filter((devolution) => devolution.order_id === orderId)}
          catalogs={returnCatalogs}
        />
      }
    />
  );
};

export default OrderDetailPage;
