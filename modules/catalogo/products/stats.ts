/** @format */

import type { ProductStatsDto } from "@/server/domains/inventory/products/types";

/** Umbral de "stock bajo" para alertas visuales. */
export const LOW_STOCK_THRESHOLD = 5;

export interface ProductStats {
  total: number;
  available: number;
  outOfStock: number;
  lowStock: number;
  /** Valor del inventario a precio de costo. */
  inventoryValue: number;
}

/** KPIs del catálogo, calculados por el backend (`GET /catalog/products/stats`). */
export const toProductStats = (stats: ProductStatsDto): ProductStats => ({
  total: stats.total ?? 0,
  available: stats.active ?? 0,
  outOfStock: stats.out_of_stock ?? 0,
  lowStock: stats.low_stock ?? 0,
  inventoryValue: stats.inventory_value ?? 0,
});
