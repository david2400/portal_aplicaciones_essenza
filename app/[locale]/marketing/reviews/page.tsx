/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_product_reviews } from "@/server/domains/reviews/product-reviews/queries";
import { lookup_products } from "@/server/domains/lookups/queries";
import { ReviewModeration } from "@/modules/marketing/review";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.review" });
  return { title: t("review"), description: tModule("description") };
}

const ReviewsPage = async () => {
  const initialData = await list_product_reviews();
  // Nombres solo de los productos reseñados (búsqueda por ids).
  const ids = [...new Set(initialData.map((review) => review.product_id).filter((id): id is number => id != null))];
  const products = ids.length > 0 ? await lookup_products({ ids }) : [];

  return <ReviewModeration initialData={initialData} products={products.map(({ id, name }) => ({ id, name }))} />;
};

export default ReviewsPage;
