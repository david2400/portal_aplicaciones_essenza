/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_attributes } from "@/server/domains/catalog/attributes/queries";
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
  const initialData = await list_attributes();

  return <AttributeManager initialData={initialData} />;
};

export default AttributesPage;
