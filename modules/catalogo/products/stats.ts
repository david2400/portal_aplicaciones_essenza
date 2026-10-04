/** @format */

import type { IProduct } from "./models/product.interface";

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

/** KPIs del catálogo (se calculan en el servidor sobre la lista completa). */
export const buildProductStats = (items: IProduct[]): ProductStats => ({
  total: items.length,
  available: items.filter((item) => item.available).length,
  outOfStock: items.filter((item) => (item.stock ?? 0) <= 0).length,
  lowStock: items.filter((item) => (item.stock ?? 0) > 0 && (item.stock ?? 0) <= LOW_STOCK_THRESHOLD).length,
  inventoryValue: items.reduce((acc, item) => acc + (item.stock ?? 0) * (item.realPrice ?? 0), 0),
});
