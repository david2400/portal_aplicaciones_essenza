/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_features } from "@/server/domains/product_details/features/queries";
import { list_unit_measurements } from "@/server/domains/product_details/unit-measurements/queries";
import { FeatureManager } from "@/modules/fichaTecnica/feature";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.feature" });

  return {
    title: t("feature"),
    description: tModule("description"),
  };
}

const FeaturePage = async () => {
  const [initialData, units] = await Promise.all([
    list_features(),
    list_unit_measurements(),
  ]);

  return <FeatureManager initialData={initialData} units={units} />;
};

export default FeaturePage;
