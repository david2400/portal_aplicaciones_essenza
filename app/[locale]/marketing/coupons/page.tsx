/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_coupons } from "@/server/domains/promotions/coupons/queries";
import { list_categories } from "@/server/domains/catalog/categories/queries";
import { CouponManager } from "@/modules/marketing/coupon";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.coupon" });
  return { title: t("coupon"), description: tModule("description") };
}

const CouponsPage = async () => {
  // Los productos de las reglas se eligen con el buscador asíncrono del formulario.
  const [initialData, categories] = await Promise.all([list_coupons(), list_categories()]);

  return (
    <CouponManager
      initialData={initialData}
      categories={categories.map(({ id, name }) => ({ id, name }))}
    />
  );
};

export default CouponsPage;
