/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_categories } from "@/server/domains/catalog/categories/queries";
import { CategoryManager } from "@/modules/catalogo/category";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.category" });

  return {
    title: t("category"),
    description: tModule("description"),
  };
}

const CategoryPage = async () => {
  const initialData = await list_categories();

  return <CategoryManager initialData={initialData} />;
};

export default CategoryPage;
