/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_shipping_costs } from "@/server/domains/shipping_logistics/product_distribution/shipping-costs/queries";
import { list_carriers } from "@/server/domains/shipping_logistics/product_distribution/carriers/queries";
import { ShippingCostManager } from "@/modules/logistica/shippingCost";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.shippingCost" });

  return { title: t("shippingCost"), description: tModule("description") };
}

const ShippingCostsPage = async () => {
  const [initialData, carriers] = await Promise.all([list_shipping_costs(), list_carriers()]);

  return (
    <ShippingCostManager
      initialData={initialData}
      carriers={carriers.map(({ id, name, base_rate, rate_per_km, is_active }) => ({
        id,
        name,
        base_rate,
        rate_per_km,
        is_active,
      }))}
    />
  );
};

export default ShippingCostsPage;
