/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_payment_types } from "@/server/domains/sales/payment-types/queries";
import { PaymentTypeManager } from "@/modules/ventas/paymentType";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.paymentType" });

  return {
    title: t("paymentType"),
    description: tModule("description"),
  };
}

const PaymentTypePage = async () => {
  const initialData = await list_payment_types();

  return <PaymentTypeManager initialData={initialData} />;
};

export default PaymentTypePage;
