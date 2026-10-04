/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_order_devolutions } from "@/server/domains/devolution/order-devolutions/queries";
import { load_devolution_catalogs } from "./catalogs";
import { DevolutionManager } from "@/modules/postventa/devolution";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.devolution" });

  return {
    title: t("devolution"),
    description: tModule("description"),
  };
}

const DevolutionsPage = async () => {
  const [initialData, catalogs] = await Promise.all([
    list_order_devolutions(),
    load_devolution_catalogs(),
  ]);

  return <DevolutionManager initialData={initialData} catalogs={catalogs} />;
};

export default DevolutionsPage;
