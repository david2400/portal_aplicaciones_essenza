/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_units } from "@/server/domains/product_details/unit-measurements/queries";
import { AttributeCreate } from "@/modules/fichaTecnica/attribute";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Administre.attribute" });
  return { title: t("createTitle") };
}

const NewAttributePage = async () => {
  const units = await list_units();
  return <AttributeCreate units={units} />;
};

export default NewAttributePage;
