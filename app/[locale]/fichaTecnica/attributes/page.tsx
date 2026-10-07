/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_attributes } from "@/server/domains/catalog/attributes/queries";
import { list_units } from "@/server/domains/product_details/unit-measurements/queries";
import { unitLabel } from "@/shared/units/units";
import { AttributeManager } from "@/modules/fichaTecnica/attribute";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.attribute" });

  return {
    title: t("attributes"),
    description: tModule("description"),
  };
}

const AttributesPage = async () => {
  const [initialData, units] = await Promise.all([list_attributes(), list_units()]);

  return <AttributeManager initialData={initialData} units={units.map((unit) => ({ id: unit.id, name: unitLabel(unit) }))} />;
};

export default AttributesPage;
