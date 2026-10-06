/** @format */

import type { ProductChildDto } from "@/server/domains/inventory/product-children/types";

/** Variante de un producto (talla, tono, presentación…). Solo tipos. */
export type IProductChild = ProductChildDto;

export type INamedItem = { id?: number; name?: string };

/** Umbral de "stock bajo" para alertas y filtros. */
export const LOW_STOCK_THRESHOLD = 5;

export type StockLevel = "out" | "low" | "ok";

export const stockLevel = (stock?: number | null): StockLevel =>
  (stock ?? 0) <= 0 ? "out" : (stock ?? 0) <= LOW_STOCK_THRESHOLD ? "low" : "ok";
