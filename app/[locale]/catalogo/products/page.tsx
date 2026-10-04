/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_brands } from "@/server/domains/catalog/brands/queries";
import { list_categories } from "@/server/domains/catalog/categories/queries";
import { list_products } from "@/server/domains/inventory/products/queries";
import { list_subcategories } from "@/server/domains/catalog/subcategories/queries";
import { list_suppliers } from "@/server/domains/inventory/suppliers/queries";
import { ProductManager } from "@/modules/catalogo/products";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.product" });

  return {
    title: t("products"),
    description: tModule("description"),
  };
}

const ProductPage = async () => {
  const [initialData, brands, categories, subcategories, suppliers] = await Promise.all([
    list_products({ size: 500 }),
    list_brands(),
    list_categories(),
    list_subcategories(),
    list_suppliers(),
  ]);

  return <ProductManager initialData={initialData} brands={brands} categories={categories} subcategories={subcategories} suppliers={suppliers} />;
};

export default ProductPage;
