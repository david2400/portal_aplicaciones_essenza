/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_categories } from "@/server/domains/catalog/categories/queries";
import { list_subcategories } from "@/server/domains/catalog/subcategories/queries";
import { search_subcategories } from "@/server/domains/catalog/subcategories/search";
import { parse_grid_query } from "@/server/lib/pagination";
import { SubcategoryManager } from "@/modules/catalogo/subcategory";
import { buildTaxonomyStats } from "@/modules/catalogo/shared/stats";
import { SUBCATEGORY_GRID } from "./grid";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

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

const SubcategoryPage = async ({ searchParams }: { searchParams: SearchParams }) => {
  const query = parse_grid_query(await searchParams, SUBCATEGORY_GRID);
  const [page, all, categories] = await Promise.all([
    search_subcategories(query),
    list_subcategories(),
    list_categories(),
  ]);

  return (
    <SubcategoryManager
      page={page}
      stats={buildTaxonomyStats(all)}
      categories={categories.map(({ id, name }) => ({ id, name }))}
    />
  );
};

export default SubcategoryPage;
