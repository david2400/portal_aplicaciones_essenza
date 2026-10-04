/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_return_methods } from "@/server/domains/devolution/return-methods/queries";
import { ReturnMethodManager } from "@/modules/postventa/returnMethod";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.returnMethod" });

  return {
    title: t("returnMethod"),
    description: tModule("description"),
  };
}

const ReturnMethodPage = async () => {
  const initialData = await list_return_methods();

  return <ReturnMethodManager initialData={initialData} />;
};

export default ReturnMethodPage;
