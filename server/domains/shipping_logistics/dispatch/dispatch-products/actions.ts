'use server';

import { revalidateTag } from 'next/cache';

import { dispatch_products_repository } from './repository';
import type {
  CreateDispatchProductDto,
  UpdateDispatchProductPayload,
  DeleteDispatchProductPayload,
  DispatchProductShippingEstimateQuery,
  DispatchProductShippingEstimateDto,
} from './types';
import { dispatch_products_tags } from '@/server/lib/cache-tags';
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

function revalidate_dispatch_product_tags(id?: number) {
  revalidateTag(dispatch_products_tags.list());
  if (typeof id === 'number') {
    revalidateTag(dispatch_products_tags.item(id));
  }
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function create_dispatch_product_action(
  payload: CreateDispatchProductDto,
): Promise<ActionResult<{ id?: number }>> {
  try {
    const result = await dispatch_products_repository.create_dispatch_product(payload);
    revalidate_dispatch_product_tags(result.id);
    return { success: true, data: { id: result.id } };
  } catch (error) {
    return handle_error(error);
  }
}

export async function update_dispatch_product_action(
  payload: UpdateDispatchProductPayload,
): Promise<ActionResult> {
  try {
    const result = await dispatch_products_repository.update_dispatch_product(payload);
    revalidate_dispatch_product_tags(result.id ?? payload.id);
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}

export async function delete_dispatch_product_action(
  payload: DeleteDispatchProductPayload,
): Promise<ActionResult> {
  try {
    await dispatch_products_repository.delete_dispatch_product(payload);
    revalidate_dispatch_product_tags(payload.id);
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}

export async function fetch_dispatch_product_shipping_estimate_action(
  query: DispatchProductShippingEstimateQuery,
): Promise<ActionResult<{ estimate: DispatchProductShippingEstimateDto }>> {
  try {
    const estimate = await dispatch_products_repository.fetch_dispatch_product_shipping_estimate(query);
    return { success: true, data: { estimate } };
  } catch (error) {
    return handle_error(error);
  }
}
