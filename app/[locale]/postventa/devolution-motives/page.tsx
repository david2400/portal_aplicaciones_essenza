/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_motive_devolutions } from "@/server/domains/devolution/motive-devolutions/queries";
import { MotiveDevolutionManager } from "@/modules/postventa/motiveDevolution";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.motiveDevolution" });

  return {
    title: t("motiveDevolution"),
    description: tModule("description"),
  };
}

const MotiveDevolutionPage = async () => {
  const initialData = await list_motive_devolutions();

  return <MotiveDevolutionManager initialData={initialData} />;
};

export default MotiveDevolutionPage;
