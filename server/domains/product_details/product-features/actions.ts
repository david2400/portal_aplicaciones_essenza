'use server';

import { revalidateTag } from 'next/cache';

import { product_features_repository } from './repository';
import type {
  CreateProductFeatureDto,
  UpdateProductFeaturePayload,
  DeleteProductFeaturePayload,
} from './types';
import { product_features_tags } from '@/server/lib/cache-tags';
import { ServerApiError } from '@/server/lib/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

type ProductFeatureIdentifier = {
  product_id?: number;
  feature_id?: number;
  productId?: number;
  featureId?: number;
};

function resolve_product_feature_ids(input: ProductFeatureIdentifier): {
  product_id: number;
  feature_id: number;
} {
  const product_id = input.product_id ?? input.productId;
  const feature_id = input.feature_id ?? input.featureId;

  if (typeof product_id !== 'number' || typeof feature_id !== 'number') {
    throw new Error('product_feature_ids_required');
  }

  return { product_id, feature_id };
}

function revalidate_product_feature_tags({
  product_id,
  feature_id,
}: {
  product_id: number;
  feature_id: number;
}) {
  revalidateTag(product_features_tags.list());
  revalidateTag(product_features_tags.item(product_id, feature_id));
}

// ─── Result helpers ──────────────────────────────────────────────────────────

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

export async function create_product_feature_action(
  payload: CreateProductFeatureDto,
): Promise<ActionResult<{ product_id: number; feature_id: number }>> {
  try {
    const result = await product_features_repository.create_product_feature(payload);
    const ids = resolve_product_feature_ids(result);
    revalidate_product_feature_tags(ids);
    return { success: true, data: ids };
  } catch (error) {
    return handle_error(error);
  }
}

export async function update_product_feature_action(
  payload: UpdateProductFeaturePayload,
): Promise<ActionResult> {
  try {
    const result = await product_features_repository.update_product_feature(payload);
    const ids = resolve_product_feature_ids({ ...payload, ...result });
    revalidate_product_feature_tags(ids);
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}

export async function delete_product_feature_action(
  payload: DeleteProductFeaturePayload,
): Promise<ActionResult> {
  try {
    await product_features_repository.delete_product_feature(payload);
    revalidate_product_feature_tags(payload);
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}
