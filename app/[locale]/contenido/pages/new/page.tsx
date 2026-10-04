/** @format */

import { CmsPageEditor } from "@/modules/contenido/cmsPage";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Administre.cmsPage" });
  return { title: t("createTitle") };
}

const NewCmsPagePage = () => <CmsPageEditor />;

export default NewCmsPagePage;
