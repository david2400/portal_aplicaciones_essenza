/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_resolutions } from "@/server/domains/billing/resolutions/queries";
import { ResolutionManager } from "@/modules/facturacion/resolution";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.billing.resolution" });
  return { title: t("resolution"), description: tModule("description") };
}

const ResolutionsPage = async () => {
  const initialData = await list_resolutions();
  return <ResolutionManager initialData={initialData} />;
};

export default ResolutionsPage;
