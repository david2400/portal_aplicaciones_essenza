/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_type_product_features } from "@/server/domains/product_details/type-product-features/queries";
import { list_type_products } from "@/server/domains/product_details/type-products/queries";
import { list_features } from "@/server/domains/product_details/features/queries";
import { TypeProductFeatureManager } from "@/modules/fichaTecnica/typeProductFeature";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.typeProductFeature" });
  return { title: t("typeProductFeature"), description: tModule("description") };
}

const TypeProductFeaturesPage = async () => {
  const [initialData, typeProducts, features] = await Promise.all([
    list_type_product_features(),
    list_type_products(),
    list_features(),
  ]);

  return (
    <TypeProductFeatureManager
      initialData={initialData}
      typeProducts={typeProducts.map(({ id, name }) => ({ id, name }))}
      features={features.map(({ id, name }) => ({ id, name }))}
    />
  );
};

export default TypeProductFeaturesPage;
