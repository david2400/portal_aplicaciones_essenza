/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_pages } from "@/server/domains/cms/pages/queries";
import { CmsPageManager } from "@/modules/contenido/cmsPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.cmsPage" });

  return { title: t("cmsPage"), description: tModule("description") };
}

const CmsPagesPage = async () => {
  const initialData = await list_pages();

  return <CmsPageManager initialData={initialData} />;
};

export default CmsPagesPage;
