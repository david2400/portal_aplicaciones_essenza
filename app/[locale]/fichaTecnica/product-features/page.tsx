/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_product_features } from "@/server/domains/product_details/product-features/queries";
import { list_features } from "@/server/domains/product_details/features/queries";
import { list_unit_measurements } from "@/server/domains/product_details/unit-measurements/queries";
import { list_products } from "@/server/domains/inventory/products/queries";
import { ProductFeatureManager } from "@/modules/fichaTecnica/productFeature";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.productFeature" });
  return { title: t("productFeature"), description: tModule("description") };
}

const ProductFeaturesPage = async () => {
  const [initialData, products, features, units] = await Promise.all([
    list_product_features(),
    list_products({ size: 500 }),
    list_features(),
    list_unit_measurements(),
  ]);

  const unitNames = new Map(units.map((unit) => [unit.id, unit.name]));

  return (
    <ProductFeatureManager
      initialData={initialData}
      products={products.map(({ id, name }) => ({ id, name }))}
      features={features.map(({ id, name, unitId }) => ({
        id,
        name,
        unitName: unitId != null ? unitNames.get(unitId) : undefined,
      }))}
    />
  );
};

export default ProductFeaturesPage;
