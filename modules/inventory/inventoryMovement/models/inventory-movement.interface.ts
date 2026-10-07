/** @format */

import type { InventoryMovementDto } from "@/server/domains/inventory/inventory-movements/types";

/** Movimiento de inventario: entrada, salida o traslado entre bodegas. */
export type IInventoryMovement = InventoryMovementDto;

export const MOVEMENT_TYPES = ["ENTRY", "EXIT", "TRANSFER"] as const;
export type MovementType = (typeof MOVEMENT_TYPES)[number];

export type INamedItem = { id?: number; name?: string };

/** Nombre de un SKU del kardex ("Producto · variante") y su código, resuelto por id en el servidor. */
export type ISkuName = { sku_id?: number; product_id?: number; code?: string; name?: string };

export const REFERENCE_TYPES = ["MANUAL", "PRODUCT_EDIT", "VARIANT_EDIT", "MIGRATION", "ORDER", "ORDER_CANCEL"] as const;
