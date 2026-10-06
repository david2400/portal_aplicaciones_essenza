/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_all_warehouses } from "@/server/domains/inventory/warehouses/queries";
import { get_city_labels } from "@/server/domains/parametros/georeferencing/queries";
import { WarehouseManager } from "@/modules/inventory/warehouse";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.warehouse" });

  return {
    title: t("warehouse"),
    description: tModule("description"),
  };
}

const WarehousePage = async () => {
  const initialData = await list_all_warehouses();
  const cityLabels = await get_city_labels(
    initialData.map((warehouse) => warehouse.city_id).filter((id): id is number => id != null),
  );

  return <WarehouseManager initialData={initialData} cityLabels={cityLabels} />;
};

export default WarehousePage;
