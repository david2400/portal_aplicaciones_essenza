/** @format */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { get_page_by_id } from "@/server/domains/cms/pages/queries";
import { ServerApiError } from "@/server/lib/types";
import { CmsPageEditor } from "@/modules/contenido/cmsPage";

type Params = Promise<{ locale: string; id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Administre.cmsPage" });
  return { title: t("editTitle") };
}

const EditCmsPagePage = async ({ params }: { params: Params }) => {
  const { id } = await params;
  const pageId = Number(id);
  if (!Number.isInteger(pageId) || pageId <= 0) notFound();

  const page = await get_page_by_id({ id: pageId }).catch((error: unknown) => {
    if (error instanceof ServerApiError && error.is_not_found) notFound();
    throw error;
  });

  return <CmsPageEditor page={page} />;
};

export default EditCmsPagePage;
