'use server';

import { revalidateTag } from 'next/cache';

import { products_repository } from './repository';
import type {
  CreateProductDto,
  UpdateProductPayload,
  DeleteProductPayload,
  ProductSearchParams,
} from './types';
import { products_tags } from '@/server/lib/cache-tags';
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

function revalidate_product_tags(id?: number) {
  revalidateTag(products_tags.list());
  if (typeof id === 'number') {
    revalidateTag(products_tags.item(id));
  }
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function create_product_action(
  payload: CreateProductDto,
): Promise<ActionResult<{ id?: number }>> {
  try {
    const result = await products_repository.create_product(payload);
    revalidate_product_tags(result.id);
    return { success: true, data: { id: result.id } };
  } catch (error) {
    return handle_error(error);
  }
}

export async function update_product_action(
  payload: UpdateProductPayload,
): Promise<ActionResult> {
  try {
    const result = await products_repository.update_product(payload);
    revalidate_product_tags(result.id ?? payload.id);
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}

export async function delete_product_action(
  payload: DeleteProductPayload,
): Promise<ActionResult> {
  try {
    await products_repository.delete_product(payload);
    revalidate_product_tags(payload.id);
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}

export async function search_products_action(
  payload: ProductSearchParams,
): Promise<ActionResult<{ results: Awaited<ReturnType<typeof products_repository.search_products>> }>> {
  try {
    const results = await products_repository.search_products(payload);
    return { success: true, data: { results } };
  } catch (error) {
    return handle_error(error);
  }
}
