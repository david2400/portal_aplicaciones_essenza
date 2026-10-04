/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_dispatch_products } from "@/server/domains/shipping_logistics/dispatch/dispatch-products/queries";
import { list_orders } from "@/server/domains/sales/orders/queries";
import { DispatchManager } from "@/modules/logistica/dispatch";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.dispatch" });

  return { title: t("dispatch"), description: tModule("description") };
}

const DispatchesPage = async () => {
  const [initialData, orders] = await Promise.all([list_dispatch_products(), list_orders()]);

  return (
    <DispatchManager
      initialData={initialData}
      orders={orders.map((order) => ({
        id: order.id,
        name: `#${order.id}${order.state ? ` · ${order.state}` : ""}`,
      }))}
    />
  );
};

export default DispatchesPage;
