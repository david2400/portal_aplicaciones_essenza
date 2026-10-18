/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SupplierEditor } from "@/modules/inventory/supplier";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Administre.supplier" });
  return { title: t("createTitle") };
}

const NewSupplierPage = () => <SupplierEditor />;

export default NewSupplierPage;
