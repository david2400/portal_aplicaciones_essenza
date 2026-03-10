'use server';

import { revalidateTag } from 'next/cache';

import { type_product_features_repository } from './repository';
import type {
  CreateTypeProductFeatureDto,
  UpdateTypeProductFeaturePayload,
  DeleteTypeProductFeaturePayload,
} from './types';
import { type_product_features_tags } from '@/server/lib/cache-tags';
import { ServerApiError } from '@/server/lib/types';

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

// ─── CRUD ────────────────────────────────────────────────────────────────────

export async function create_type_product_feature_action(
  payload: CreateTypeProductFeatureDto,
): Promise<ActionResult<{ type_product_id: number }>> {
  try {
    const result = await type_product_features_repository.create_type_product_feature(payload);
    const type_product_id = result.typeProductId ?? payload.typeProductId;
    if (typeof type_product_id !== 'number') {
      return { success: false, error: 'type_product_feature_id_not_returned' };
    }
    revalidateTag(type_product_features_tags.list());
    revalidateTag(type_product_features_tags.item(type_product_id));
    return { success: true, data: { type_product_id } };
  } catch (error) {
    return handle_error(error);
  }
}

export async function update_type_product_feature_action(
  payload: UpdateTypeProductFeaturePayload,
): Promise<ActionResult> {
  try {
    await type_product_features_repository.update_type_product_feature(payload);
    revalidateTag(type_product_features_tags.list());
    revalidateTag(type_product_features_tags.item(payload.type_product_id));
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}

export async function delete_type_product_feature_action(
  payload: DeleteTypeProductFeaturePayload,
): Promise<ActionResult> {
  try {
    await type_product_features_repository.delete_type_product_feature(payload);
    revalidateTag(type_product_features_tags.list());
    revalidateTag(type_product_features_tags.item(payload.type_product_id));
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}
