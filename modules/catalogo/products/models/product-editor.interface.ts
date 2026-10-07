/** @format */

import type { ProductChildDto } from "@/server/domains/inventory/product-children/types";
import type { ProductComboDto } from "@/server/domains/inventory/product-combos/types";
import type { ProductImageDto, ProductSkuDto } from "@/server/domains/inventory/products/types";
import type { StockItemDto, StockReservationDto } from "@/server/domains/inventory/stock/types";

/** Pestañas del editor de producto (Fase 6). `combo` solo aparece si el producto es combo. */
export const EDITOR_TABS = ["general", "variants", "specs", "images", "stock", "combo"] as const;
export type EditorTab = (typeof EDITOR_TABS)[number];

export const isEditorTab = (value: unknown): value is EditorTab =>
  typeof value === "string" && (EDITOR_TABS as readonly string[]).includes(value);

export type IProductVariant = ProductChildDto;
export type IProductSku = ProductSkuDto;
export type IProductImage = ProductImageDto;
export type IStockLevel = StockItemDto;
export type IStockReservation = StockReservationDto;
/** Componente del combo con el nombre del producto resuelto en el servidor. */
export type IComboItem = ProductComboDto & { product_name?: string };
export type INamedItem = { id?: number; name?: string };

/** Máximo de imágenes de la galería general (lo valida también el backend). */
export const MAX_GALLERY_IMAGES = 30;
