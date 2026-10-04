/** @format */

import type { InventoryMovementDto } from "@/server/domains/inventory/inventory-movements/types";

/** Movimiento de inventario: entrada, salida o traslado entre bodegas. */
export type IInventoryMovement = InventoryMovementDto;

export const MOVEMENT_TYPES = ["ENTRY", "EXIT", "TRANSFER"] as const;
export type MovementType = (typeof MOVEMENT_TYPES)[number];

export type INamedItem = { id?: number; name?: string };
