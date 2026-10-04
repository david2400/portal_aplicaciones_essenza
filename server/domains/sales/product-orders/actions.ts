'use server';

import { revalidateTag } from 'next/cache';

import { product_orders_repository } from './repository';
import type { CreateProductOrderPayload, UpdateProductOrderPayload, DeleteProductOrderPayload } from './types';
import { product_orders_tags } from '@/server/lib/cache-tags';
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

function revalidate_product_orders(id?: number) {
  revalidateTag(product_orders_tags.list());
  if (id != null) {
    revalidateTag(product_orders_tags.item(id));
  }
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function create_product_order_action(
  payload: CreateProductOrderPayload,
): Promise<ActionResult<{ id?: number }>> {
  try {
    const result = await product_orders_repository.create_product_order(payload);
    revalidate_product_orders(result.id);
    return { success: true, data: { id: result.id } };
  } catch (error) {
    return handle_error(error);
  }
}

export async function update_product_order_action(payload: UpdateProductOrderPayload): Promise<ActionResult> {
  try {
    await product_orders_repository.update_product_order(payload);
    revalidate_product_orders(payload.id);
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}

export async function delete_product_order_action(payload: DeleteProductOrderPayload): Promise<ActionResult> {
  try {
    await product_orders_repository.delete_product_order(payload);
    revalidate_product_orders(payload.id);
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}
