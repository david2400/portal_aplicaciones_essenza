/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_product_recommendations } from "@/server/domains/recommendations/products/queries";
import { list_products } from "@/server/domains/inventory/products/queries";
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
  const [initialData, products] = await Promise.all([
    list_product_recommendations(),
    list_products({ size: 500 }),
  ]);

  return (
    <RecommendationManager
      initialData={initialData}
      products={products.map(({ id, name, unitPrice, imageUrl }) => ({ id, name, unitPrice, imageUrl }))}
    />
  );
};

export default RecommendationsPage;
