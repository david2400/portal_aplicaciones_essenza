/** @format */

import React from "react";
import { getTranslations } from "next-intl/server";
import { SectionShell } from "@/components/layout/section-shell";

export default async function AdministreLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Administre" });

  return (
    <SectionShell
      eyebrow={t("sectionLabel")}
      title={t("pageTitle")}
      description={t("pageDescription")}>
      {children}
    </SectionShell>
  );
}
