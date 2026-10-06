/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_product_children } from "@/server/domains/inventory/product-children/queries";
import { list_products } from "@/server/domains/inventory/products/queries";
import { ProductChildManager } from "@/modules/catalogo/productChild";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.productChild" });
  return { title: t("productChild"), description: tModule("description") };
}

const ProductVariantsPage = async () => {
  const [initialData, products] = await Promise.all([list_product_children(), list_products({ size: 500 })]);

  return <ProductChildManager initialData={initialData} products={products.map(({ id, name }) => ({ id, name }))} />;
};

export default ProductVariantsPage;
