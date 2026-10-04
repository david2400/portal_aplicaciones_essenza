/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_categories } from "@/server/domains/catalog/categories/queries";
import { search_categories } from "@/server/domains/catalog/categories/search";
import { parse_grid_query } from "@/server/lib/pagination";
import { CategoryManager } from "@/modules/catalogo/category";
import { buildTaxonomyStats } from "@/modules/catalogo/shared/stats";
import { CATEGORY_GRID } from "./grid";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

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

const CategoryPage = async ({ searchParams }: { searchParams: SearchParams }) => {
  const query = parse_grid_query(await searchParams, CATEGORY_GRID);
  const [page, all] = await Promise.all([search_categories(query), list_categories()]);

  return <CategoryManager page={page} stats={buildTaxonomyStats(all)} />;
};

export default CategoryPage;
