/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OrderEditor } from "@/modules/ventas/order";
import { load_order_catalogs } from "../catalogs";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Administre.order" });
  return { title: t("createTitle") };
}

const NewOrderPage = async () => {
  const catalogs = await load_order_catalogs();
  return <OrderEditor {...catalogs} />;
};

export default NewOrderPage;
