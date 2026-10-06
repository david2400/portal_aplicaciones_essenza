/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_attributes } from "@/server/domains/catalog/attributes/queries";
import { list_product_templates } from "@/server/domains/catalog/product-templates/queries";
import { ProductTemplateManager } from "@/modules/fichaTecnica/productTemplate";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.productTemplate" });

  return {
    title: t("productTemplates"),
    description: tModule("description"),
  };
}

const TemplatesPage = async () => {
  const [initialData, attributes] = await Promise.all([list_product_templates(), list_attributes()]);

  return (
    <ProductTemplateManager
      initialData={initialData}
      attributes={attributes.map(({ id, name, code, data_type }) => ({ id, name, code, data_type }))}
    />
  );
};

export default TemplatesPage;
