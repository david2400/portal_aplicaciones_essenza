/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ProductCreate } from "@/modules/catalogo/products";
import { list_units } from "@/server/domains/product_details/unit-measurements/queries";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Administre.product" });
  return { title: t("createTitle") };
}

const NewProductPage = async () => {
  const units = await list_units();
  return <ProductCreate units={units} />;
};

export default NewProductPage;
