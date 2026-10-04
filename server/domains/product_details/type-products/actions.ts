'use server';

import { revalidateTag } from 'next/cache';

import { type_products_repository } from './repository';
import type { CreateTypeProductPayload, UpdateTypeProductPayload, DeleteTypeProductPayload } from './types';
import { type_products_tags } from '@/server/lib/cache-tags';
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

function revalidate_type_products(id?: number) {
  revalidateTag(type_products_tags.list());
  if (id != null) {
    revalidateTag(type_products_tags.item(id));
  }
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function create_type_product_action(
  payload: CreateTypeProductPayload,
): Promise<ActionResult<{ id?: number }>> {
  try {
    const result = await type_products_repository.create_type_product(payload);
    revalidate_type_products(result.id);
    return { success: true, data: { id: result.id } };
  } catch (error) {
    return handle_error(error);
  }
}

export async function update_type_product_action(payload: UpdateTypeProductPayload): Promise<ActionResult> {
  try {
    await type_products_repository.update_type_product(payload);
    revalidate_type_products(payload.id);
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}

export async function delete_type_product_action(payload: DeleteTypeProductPayload): Promise<ActionResult> {
  try {
    await type_products_repository.delete_type_product(payload);
    revalidate_type_products(payload.id);
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}
