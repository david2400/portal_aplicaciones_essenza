/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_gateway_providers, list_payment_methods } from "@/server/domains/sales/payment-methods/queries";
import { PaymentMethodManager } from "@/modules/ventas/paymentMethod";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.paymentMethod" });

  return { title: t("paymentMethod"), description: tModule("description") };
}

const PaymentMethodsPage = async () => {
  const [initialData, providers] = await Promise.all([list_payment_methods(true), list_gateway_providers()]);

  return <PaymentMethodManager initialData={initialData} providers={providers} />;
};

export default PaymentMethodsPage;
