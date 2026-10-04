/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_brands } from "@/server/domains/catalog/brands/queries";
import { BrandManager } from "@/modules/catalogo/brand";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.brand" });

  return {
    title: t("brand"),
    description: tModule("description"),
  };
}

const BrandPage = async () => {
  const initialData = await list_brands();

  return <BrandManager initialData={initialData} />;
};

export default BrandPage;
