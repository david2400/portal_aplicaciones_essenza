'use server';

import { revalidateTag } from 'next/cache';

import { orders_repository } from './repository';
import type { CreateOrderDto } from './types';
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

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function create_order_action(
  payload: CreateOrderDto,
): Promise<ActionResult<{ id?: number }>> {
  try {
    const result = await orders_repository.create_order(payload);
    revalidateTag(orders_tags.list());
    return { success: true, data: { id: result.id } };
  } catch (error) {
    return handle_error(error);
  }
}
