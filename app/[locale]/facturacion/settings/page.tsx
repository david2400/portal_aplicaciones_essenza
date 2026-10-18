/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HiOutlineCog6Tooth } from "react-icons/hi2";
import { get_billing_settings } from "@/server/domains/billing/settings/queries";
import { PageHeader } from "@/components/page-header";
import { BillingSettingsForm } from "@/modules/facturacion/settings";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.billing.settings" });
  return { title: t("billingSettings"), description: tModule("description") };
}

const BillingSettingsPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  const [settings, tSettings, tCrud] = await Promise.all([
    get_billing_settings(),
    getTranslations({ locale, namespace: "Administre.billing.settings" }),
    getTranslations({ locale, namespace: "Crud" }),
  ]);
  return (
    <section className='flex w-full flex-col gap-6'>
      <PageHeader title={tSettings("title")} description={tSettings("description")} icon={HiOutlineCog6Tooth} eyebrow={tCrud("domains.billing")} />
      <BillingSettingsForm key={JSON.stringify(settings)} settings={settings} />
    </section>
  );
};

export default BillingSettingsPage;
