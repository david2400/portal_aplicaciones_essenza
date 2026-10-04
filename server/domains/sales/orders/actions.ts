'use server';

import { revalidateTag } from 'next/cache';

import { orders_repository } from './repository';
import type { CreateOrderPayload, UpdateOrderPayload, DeleteOrderPayload } from './types';
import { orders_tags } from '@/server/lib/cache-tags';
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

function revalidate_orders(id?: number) {
  revalidateTag(orders_tags.list());
  if (id != null) {
    revalidateTag(orders_tags.item(id));
  }
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function create_order_action(
  payload: CreateOrderPayload,
): Promise<ActionResult<{ id?: number }>> {
  try {
    const result = await orders_repository.create_order(payload);
    revalidate_orders(result.id);
    return { success: true, data: { id: result.id } };
  } catch (error) {
    return handle_error(error);
  }
}

export async function update_order_action(payload: UpdateOrderPayload): Promise<ActionResult> {
  try {
    await orders_repository.update_order(payload);
    revalidate_orders(payload.id);
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}

export async function delete_order_action(payload: DeleteOrderPayload): Promise<ActionResult> {
  try {
    await orders_repository.delete_order(payload);
    revalidate_orders(payload.id);
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}
