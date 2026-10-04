/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_personalization_profiles } from "@/server/domains/advanced_features/personalization-profiles/queries";
import { PersonalizationManager } from "@/modules/catalogo/personalizationProfile";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.personalization" });

  return { title: t("personalization"), description: tModule("description") };
}

const PersonalizationPage = async () => {
  const initialData = await list_personalization_profiles();

  return <PersonalizationManager initialData={initialData} />;
};

export default PersonalizationPage;
