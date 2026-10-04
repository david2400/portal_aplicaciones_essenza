/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_order_devolutions } from "@/server/domains/devolution/order-devolutions/queries";
import { search_order_devolutions } from "@/server/domains/devolution/order-devolutions/search";
import { parse_grid_query } from "@/server/lib/pagination";
import { buildDevolutionStats } from "@/modules/postventa/devolution/stats";
import { DEVOLUTION_GRID } from "./grid";
import { load_devolution_catalogs } from "./catalogs";
import { DevolutionManager } from "@/modules/postventa/devolution";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.devolution" });

  return {
    title: t("devolution"),
    description: tModule("description"),
  };
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const DevolutionsPage = async ({ searchParams }: { searchParams: SearchParams }) => {
  const query = parse_grid_query(await searchParams, DEVOLUTION_GRID);
  const [page, all, catalogs] = await Promise.all([
    search_order_devolutions(query),
    list_order_devolutions(),
    load_devolution_catalogs(),
  ]);

  return <DevolutionManager page={page} stats={buildDevolutionStats(all)} catalogs={catalogs} />;
};

export default DevolutionsPage;
