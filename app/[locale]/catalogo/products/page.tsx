/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_brands } from "@/server/domains/catalog/brands/queries";
import { list_categories } from "@/server/domains/catalog/categories/queries";
import { list_subcategories } from "@/server/domains/catalog/subcategories/queries";
import { list_products } from "@/server/domains/inventory/products/queries";
import { search_products } from "@/server/domains/inventory/products/search";
import { list_suppliers } from "@/server/domains/inventory/suppliers/queries";
import { list_attributes } from "@/server/domains/catalog/attributes/queries";
import { list_product_templates } from "@/server/domains/catalog/product-templates/queries";
import { parse_grid_query } from "@/server/lib/pagination";
import { ProductManager } from "@/modules/catalogo/products";
import { buildProductStats } from "@/modules/catalogo/products/stats";
import { PRODUCT_GRID } from "./grid";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

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

const named = (items: Array<{ id?: number; name?: string }>) => items.map(({ id, name }) => ({ id, name }));

const ProductPage = async ({ searchParams }: { searchParams: SearchParams }) => {
  const query = parse_grid_query(await searchParams, PRODUCT_GRID);
  const [page, all, brands, categories, subcategories, suppliers, templates, attributes] = await Promise.all([
    search_products(query),
    list_products({ size: 500 }),
    list_brands(),
    list_categories(),
    list_subcategories(),
    list_suppliers(),
    list_product_templates(),
    list_attributes(),
  ]);

  return (
    <ProductManager
      page={page}
      stats={buildProductStats(all)}
      brands={named(brands)}
      categories={named(categories)}
      subcategories={subcategories.map(({ id, name, category_id }) => ({ id, name, category_id }))}
      suppliers={named(suppliers)}
      templates={templates}
      attributes={attributes}
    />
  );
};

export default ProductPage;
