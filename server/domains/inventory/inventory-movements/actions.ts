'use server';

import { revalidateTag } from 'next/cache';

import { inventory_movements_repository } from './repository';
import type { InventoryMovementDto } from './types';
import { inventory_movements_tags } from '@/server/lib/cache-tags';
import { ServerApiError } from '@/server/lib/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; status?: number };

function handle_error(error: unknown): ActionResult<never> {
  if (error instanceof ServerApiError) {
    return { success: false, error: error.message, status: error.status };
  }
  const message = error instanceof Error ? error.message : 'Unexpected error';
  return { success: false, error: message };
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function transfer_inventory_action(
  payload: InventoryMovementDto,
): Promise<ActionResult> {
  try {
    await inventory_movements_repository.transfer_inventory(payload);
    revalidateTag(inventory_movements_tags.transfers());
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}

export async function exit_inventory_action(
  payload: InventoryMovementDto,
): Promise<ActionResult> {
  try {
    await inventory_movements_repository.exit_inventory(payload);
    revalidateTag(inventory_movements_tags.exits());
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}

export async function entry_inventory_action(
  payload: InventoryMovementDto,
): Promise<ActionResult> {
  try {
    await inventory_movements_repository.entry_inventory(payload);
    revalidateTag(inventory_movements_tags.entries());
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}
