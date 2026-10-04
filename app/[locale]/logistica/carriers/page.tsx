/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_carriers } from "@/server/domains/shipping_logistics/product_distribution/carriers/queries";
import { CarrierManager } from "@/modules/logistica/carrier";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.carrier" });

  return {
    title: t("carrier"),
    description: tModule("description"),
  };
}

const CarrierPage = async () => {
  const initialData = await list_carriers();

  return <CarrierManager initialData={initialData} />;
};

export default CarrierPage;
