/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_product_combos } from "@/server/domains/inventory/product-combos/queries";
import { list_products } from "@/server/domains/inventory/products/queries";
import { ComboManager } from "@/modules/catalogo/combosProduct";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.combo" });

  return {
    title: t("combo"),
    description: tModule("description"),
  };
}

const ComboPage = async () => {
  const [initialData, products] = await Promise.all([
    list_product_combos(),
    list_products({ size: 500 }),
  ]);

  return <ComboManager initialData={initialData} products={products} />;
};

export default ComboPage;
