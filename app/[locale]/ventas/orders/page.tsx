/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_orders } from "@/server/domains/sales/orders/queries";
import { list_product_orders } from "@/server/domains/sales/product-orders/queries";
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

const OrdersPage = async () => {
  const [initialData, items] = await Promise.all([list_orders(), list_product_orders()]);

  return <OrderManager initialData={initialData} items={items} />;
};

export default OrdersPage;
