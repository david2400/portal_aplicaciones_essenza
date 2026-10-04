/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_unit_measurements } from "@/server/domains/product_details/unit-measurements/queries";
import { UnitMeasurementManager } from "@/modules/fichaTecnica/unitMeasurement";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.unitMeasurement" });

  return {
    title: t("unitMeasurement"),
    description: tModule("description"),
  };
}

const UnitMeasurementPage = async () => {
  const initialData = await list_unit_measurements();

  return <UnitMeasurementManager initialData={initialData} />;
};

export default UnitMeasurementPage;
