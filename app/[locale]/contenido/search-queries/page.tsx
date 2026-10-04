/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_search_queries } from "@/server/domains/smart_search/queries/queries";
import { SearchQueryManager } from "@/modules/contenido/searchQuery";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.searchQuery" });

  return { title: t("searchQuery"), description: tModule("description") };
}

const SearchQueriesPage = async () => {
  const initialData = await list_search_queries();

  return <SearchQueryManager initialData={initialData} />;
};

export default SearchQueriesPage;
