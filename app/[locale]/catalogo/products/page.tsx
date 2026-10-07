/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_brands } from "@/server/domains/catalog/brands/queries";
import { list_categories } from "@/server/domains/catalog/categories/queries";
import { list_subcategories } from "@/server/domains/catalog/subcategories/queries";
import { get_product_stats } from "@/server/domains/inventory/products/queries";
import { search_products } from "@/server/domains/inventory/products/search";
import { parse_grid_query } from "@/server/lib/pagination";
import { ProductManager } from "@/modules/catalogo/products";
import { LOW_STOCK_THRESHOLD, toProductStats } from "@/modules/catalogo/products/stats";
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
  // Marcas/categorías/subcategorías alimentan los filtros y nombres de la tabla; el
  // formulario de alta y el editor usan buscadores asíncronos.
  const [page, stats, brands, categories, subcategories] = await Promise.all([
    search_products(query),
    get_product_stats({ low_stock_threshold: LOW_STOCK_THRESHOLD, low_stock_limit: 0 }),
    list_brands(),
    list_categories(),
    list_subcategories(),
  ]);

  return (
    <ProductManager
      page={page}
      stats={toProductStats(stats)}
      brands={named(brands)}
      categories={named(categories)}
      subcategories={subcategories.map(({ id, name, category_id }) => ({ id, name, category_id }))}
    />
  );
};

export default ProductPage;
