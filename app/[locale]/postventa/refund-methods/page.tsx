/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_refund_methods } from "@/server/domains/devolution/refund-methods/queries";
import { RefundMethodManager } from "@/modules/postventa/refundMethod";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.refundMethod" });

  return {
    title: t("refundMethod"),
    description: tModule("description"),
  };
}

const RefundMethodPage = async () => {
  const initialData = await list_refund_methods();

  return <RefundMethodManager initialData={initialData} />;
};

export default RefundMethodPage;
