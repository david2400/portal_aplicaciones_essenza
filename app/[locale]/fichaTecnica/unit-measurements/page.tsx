/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_units } from "@/server/domains/product_details/unit-measurements/queries";
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
  // Incluye las inactivas: la pantalla permite reactivarlas.
  const initialData = await list_units({ include_inactive: true });

  return <UnitMeasurementManager initialData={initialData} />;
};

export default UnitMeasurementPage;
