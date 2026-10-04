'use server';

import {
  entry_inventory_action,
  exit_inventory_action,
  transfer_inventory_action,
} from '@/server/domains/inventory/inventory-movements/actions';
import type { InventoryMovementDto } from '@/server/domains/inventory/inventory-movements/types';

type ActionResult = { success: true } | { success: false; error: string };

const HANDLERS = {
  ENTRY: entry_inventory_action,
  EXIT: exit_inventory_action,
  TRANSFER: transfer_inventory_action,
} as const;

/**
 * Registra un movimiento en el endpoint que corresponde a su tipo
 * (`/entry`, `/exit` o `/transfer`). Devuelve el resultado en lugar de lanzar.
 */
export async function registerMovementServerAction(payload: InventoryMovementDto): Promise<ActionResult> {
  const handler = HANDLERS[payload.type as keyof typeof HANDLERS];
  if (!handler) {
    return { success: false, error: `Tipo de movimiento no válido: ${payload.type}` };
  }

  const result = await handler(payload);
  return result.success
    ? { success: true }
    : { success: false, error: result.error ?? 'No se pudo registrar el movimiento' };
}
