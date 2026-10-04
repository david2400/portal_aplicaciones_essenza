/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_delivery_estimates } from "@/server/domains/shipping_logistics/product_distribution/delivery-estimates/queries";
import { list_carriers } from "@/server/domains/shipping_logistics/product_distribution/carriers/queries";
import { DeliveryEstimateManager } from "@/modules/logistica/deliveryEstimate";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.deliveryEstimate" });

  return { title: t("deliveryEstimate"), description: tModule("description") };
}

const DeliveryEstimatesPage = async () => {
  const [initialData, carriers] = await Promise.all([list_delivery_estimates(), list_carriers()]);

  return (
    <DeliveryEstimateManager
      initialData={initialData}
      carriers={carriers.map(({ id, name, maxDeliveryDays, isActive }) => ({
        id,
        name,
        maxDeliveryDays,
        isActive,
      }))}
    />
  );
};

export default DeliveryEstimatesPage;
