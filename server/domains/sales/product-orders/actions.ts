'use server';

import { revalidateTag } from 'next/cache';

import { product_orders_repository } from './repository';
import type { CreateProductOrderDto } from './types';
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

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function create_product_order_action(
  payload: CreateProductOrderDto,
): Promise<ActionResult<{ id?: number }>> {
  try {
    const result = await product_orders_repository.create_product_order(payload);
    revalidateTag(product_orders_tags.list());
    return { success: true, data: { id: result.id } };
  } catch (error) {
    return handle_error(error);
  }
}
