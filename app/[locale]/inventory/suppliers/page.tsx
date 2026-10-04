/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_suppliers } from "@/server/domains/inventory/suppliers/queries";
import { SupplierManager } from "@/modules/inventory/supplier";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.supplier" });

  return {
    title: t("supplier"),
    description: tModule("description"),
  };
}

const SupplierPage = async () => {
  const initialData = await list_suppliers();

  return <SupplierManager initialData={initialData} />;
};

export default SupplierPage;
