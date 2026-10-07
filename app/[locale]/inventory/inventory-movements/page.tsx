/** @format */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { list_inventory_movements } from "@/server/domains/inventory/inventory-movements/queries";
import { lookup_products, lookup_skus } from "@/server/domains/lookups/queries";
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

const distinct = (values: Array<number | undefined>) =>
  [...new Set(values.filter((value): value is number => value != null))];

const InventoryMovementsPage = async () => {
  const [initialData, warehouses] = await Promise.all([list_inventory_movements(), list_all_warehouses()]);

  // Nombres solo de lo que aparece en el kardex (búsqueda por ids), no del catálogo entero.
  const skuIds = distinct(initialData.map((movement) => movement.sku_id));
  const legacyProductIds = distinct(initialData.filter((movement) => movement.sku_id == null).map((movement) => movement.product_id));
  const [skus, products] = await Promise.all([
    skuIds.length > 0 ? lookup_skus({ ids: skuIds }) : Promise.resolve([]),
    legacyProductIds.length > 0 ? lookup_products({ ids: legacyProductIds }) : Promise.resolve([]),
  ]);

  return (
    <InventoryMovementManager
      initialData={initialData}
      skus={skus.map(({ sku_id, product_id, code, name }) => ({ sku_id, product_id, code, name }))}
      products={products.map(({ id, name }) => ({ id, name }))}
      warehouses={warehouses.map(({ id, name, code }) => ({ id, name: code ? `${code} · ${name}` : name }))}
    />
  );
};

export default InventoryMovementsPage;
