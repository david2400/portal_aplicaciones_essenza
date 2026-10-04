/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_inventory_movements } from "@/server/domains/inventory/inventory-movements/queries";
import { list_products } from "@/server/domains/inventory/products/queries";
import { list_all_warehouses } from "@/server/domains/inventory/warehouses/queries";
import { InventoryMovementManager } from "@/modules/inventory/inventoryMovement";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Titles" });
  const tModule = await getTranslations({ locale, namespace: "Administre.inventoryMovement" });
  return { title: t("inventoryMovement"), description: tModule("description") };
}

const InventoryMovementsPage = async () => {
  const [initialData, products, warehouses] = await Promise.all([
    list_inventory_movements(),
    list_products({ size: 500 }),
    list_all_warehouses(),
  ]);

  return (
    <InventoryMovementManager
      initialData={initialData}
      products={products.map(({ id, name }) => ({ id, name }))}
      warehouses={warehouses.map(({ id, name, code }) => ({ id, name: code ? `${code} · ${name}` : name }))}
    />
  );
};

export default InventoryMovementsPage;
