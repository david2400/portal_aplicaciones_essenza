/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_tax_rates } from "@/server/domains/billing/tax-rates/queries";
import { TaxRateManager } from "@/modules/facturacion/taxRate";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.billing.taxRate" });
  return { title: t("taxRate"), description: tModule("description") };
}

const TaxRatesPage = async () => {
  const initialData = await list_tax_rates(true);
  return <TaxRateManager initialData={initialData} />;
};

export default TaxRatesPage;
