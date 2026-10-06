/** @format */

import type { InventoryMovementDto } from "@/server/domains/inventory/inventory-movements/types";

/** Movimiento de inventario: entrada, salida o traslado entre bodegas. */
export type IInventoryMovement = InventoryMovementDto;

export const MOVEMENT_TYPES = ["ENTRY", "EXIT", "TRANSFER"] as const;
export type MovementType = (typeof MOVEMENT_TYPES)[number];

export type INamedItem = { id?: number; name?: string };

/** SKU de una variante (para elegir qué variante se mueve). */
export type ISkuOption = { id?: number; name?: string; code?: string };

/** Producto con sus variantes vendibles (vacío si no tiene variantes). */
export type IProductWithSkus = INamedItem & { skus?: ISkuOption[] };

export const REFERENCE_TYPES = ["MANUAL", "PRODUCT_EDIT", "VARIANT_EDIT", "MIGRATION", "ORDER", "ORDER_CANCEL"] as const;
