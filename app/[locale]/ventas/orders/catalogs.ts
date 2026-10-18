import 'server-only';

import { list_stores } from '@/server/domains/sales/cash/queries';
import { list_all_warehouses } from '@/server/domains/inventory/warehouses/queries';
import { list_carriers } from '@/server/domains/shipping_logistics/product_distribution/carriers/queries';

/** Tiendas activas, bodegas que despachan y transportadoras activas para la orden. */
export async function load_order_catalogs() {
  const [stores, warehouses, carriers] = await Promise.all([
    list_stores(false).catch(() => []),
    list_all_warehouses().catch(() => []),
    list_carriers().catch(() => []),
  ]);
  return {
    stores: stores.map(({ id, name, code, warehouse_id }) => ({ id, name: code ? `${code} · ${name}` : name, warehouse_id })),
    warehouses: warehouses
      .filter((warehouse) => warehouse.active !== false)
      .map(({ id, name, code }) => ({ id, name: code ? `${code} · ${name}` : name })),
    carriers: carriers.filter((carrier) => carrier.is_active !== false).map(({ id, name }) => ({ id, name })),
  };
}
