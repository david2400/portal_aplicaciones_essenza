/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_gateway_providers } from "@/server/domains/sales/payment-methods/queries";
import { PaymentMethodCreate } from "@/modules/ventas/paymentMethod";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Administre.paymentMethod" });
  return { title: t("createTitle") };
}

const NewPaymentMethodPage = async () => {
  const providers = await list_gateway_providers();
  return <PaymentMethodCreate providers={providers} />;
};

export default NewPaymentMethodPage;
