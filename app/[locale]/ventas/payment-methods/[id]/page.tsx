/** @format */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { get_payment_method_by_id, list_gateway_providers } from "@/server/domains/sales/payment-methods/queries";
import { ServerApiError } from "@/server/lib/types";
import { PaymentMethodEditor } from "@/modules/ventas/paymentMethod";

type Params = Promise<{ locale: string; id: string }>;

const parseId = (value: string) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "Administre.paymentMethod.form" });
  return { title: t("metaTitle", { id }) };
}

const PaymentMethodEditorPage = async ({ params }: { params: Params }) => {
  const { id } = await params;
  const methodId = parseId(id);
  if (methodId == null) notFound();

  const [method, providers] = await Promise.all([
    get_payment_method_by_id({ id: methodId }).catch((error: unknown) => {
      if (error instanceof ServerApiError && error.is_not_found) notFound();
      throw error;
    }),
    list_gateway_providers(),
  ]);

  return <PaymentMethodEditor method={method} providers={providers} />;
};

export default PaymentMethodEditorPage;
