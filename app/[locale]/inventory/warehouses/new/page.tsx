/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { WarehouseEditor } from "@/modules/inventory/warehouse";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Administre.warehouse" });
  return { title: t("createTitle") };
}

const NewWarehousePage = () => <WarehouseEditor />;

export default NewWarehousePage;
