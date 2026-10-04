/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_categories } from "@/server/domains/catalog/categories/queries";
import { list_subcategories } from "@/server/domains/catalog/subcategories/queries";
import { SubcategoryManager } from "@/modules/catalogo/subcategory";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.subcategory" });

  return {
    title: t("subcategory"),
    description: tModule("description"),
  };
}

const SubcategoryPage = async () => {
  const [initialData, categories] = await Promise.all([
    list_subcategories(),
    list_categories(),
  ]);

  return <SubcategoryManager initialData={initialData} categories={categories} />;
};

export default SubcategoryPage;
