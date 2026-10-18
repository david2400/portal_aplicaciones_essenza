/** @format */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { get_cash_session } from "@/server/domains/sales/cash/queries";
import { ServerApiError } from "@/server/lib/types";
import { CashSessionDetail } from "@/modules/ventas/cash";

type Params = Promise<{ locale: string; id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "Administre.cash.session" });
  return { title: t("label", { id }) };
}

const CashSessionPage = async ({ params }: { params: Params }) => {
  const { id } = await params;
  const sessionId = Number(id);
  if (!Number.isInteger(sessionId) || sessionId <= 0) notFound();
  const session = await get_cash_session({ id: sessionId }).catch((error: unknown) => {
    if (error instanceof ServerApiError && error.is_not_found) notFound();
    throw error;
  });
  return <CashSessionDetail session={session} />;
};

export default CashSessionPage;
