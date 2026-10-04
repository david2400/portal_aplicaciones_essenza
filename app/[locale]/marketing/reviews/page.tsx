/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_product_reviews } from "@/server/domains/reviews/product-reviews/queries";
import { list_products } from "@/server/domains/inventory/products/queries";
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
  const [initialData, products] = await Promise.all([list_product_reviews(), list_products({ size: 500 })]);

  return <ReviewModeration initialData={initialData} products={products.map(({ id, name }) => ({ id, name }))} />;
};

export default ReviewsPage;
