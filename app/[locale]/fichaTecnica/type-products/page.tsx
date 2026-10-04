/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_type_products } from "@/server/domains/product_details/type-products/queries";
import { TypeProductManager } from "@/modules/fichaTecnica/typeProduct";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.typeProduct" });

  return {
    title: t("typeProduct"),
    description: tModule("description"),
  };
}

const TypeProductPage = async () => {
  const initialData = await list_type_products();

  return <TypeProductManager initialData={initialData} />;
};

export default TypeProductPage;
