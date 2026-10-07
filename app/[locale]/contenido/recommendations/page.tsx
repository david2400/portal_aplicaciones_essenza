/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_product_recommendations } from "@/server/domains/recommendations/products/queries";
import { RecommendationManager } from "@/modules/contenido/recommendation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.recommendation" });

  return { title: t("recommendation"), description: tModule("description") };
}

const RecommendationsPage = async () => {
  // El producto se elige con el buscador asíncrono del formulario.
  const initialData = await list_product_recommendations();

  return <RecommendationManager initialData={initialData} />;
};

export default RecommendationsPage;
