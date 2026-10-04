/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_brands } from "@/server/domains/catalog/brands/queries";
import { search_brands } from "@/server/domains/catalog/brands/search";
import { parse_grid_query } from "@/server/lib/pagination";
import { BrandManager } from "@/modules/catalogo/brand";
import { buildTaxonomyStats } from "@/modules/catalogo/shared/stats";
import { BRAND_GRID } from "./grid";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

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

const BrandPage = async ({ searchParams }: { searchParams: SearchParams }) => {
  const query = parse_grid_query(await searchParams, BRAND_GRID);
  const [page, all] = await Promise.all([search_brands(query), list_brands()]);

  return <BrandManager page={page} stats={buildTaxonomyStats(all)} />;
};

export default BrandPage;
