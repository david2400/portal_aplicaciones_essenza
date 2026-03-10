'use server';

import { revalidateTag } from 'next/cache';

import { features_repository } from './repository';
import type {
  CreateFeatureDto,
  UpdateFeaturePayload,
  DeleteFeaturePayload,
} from './types';
import { features_tags } from '@/server/lib/cache-tags';
import { ServerApiError } from '@/server/lib/types';

// ─── Utilities ────────────────────────────────────────────────────────────────

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

function revalidate_feature_tags(id: number) {
  revalidateTag(features_tags.list());
  revalidateTag(features_tags.item(id));
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function create_feature_action(
  payload: CreateFeatureDto,
): Promise<ActionResult<{ id: number }>> {
  try {
    const result = await features_repository.create_feature(payload);
    const id = result.id;
    if (typeof id !== 'number') {
      return { success: false, error: 'feature_id_not_returned' };
    }
    revalidate_feature_tags(id);
    return { success: true, data: { id } };
  } catch (error) {
    return handle_error(error);
  }
}

export async function update_feature_action(payload: UpdateFeaturePayload): Promise<ActionResult> {
  try {
    await features_repository.update_feature(payload);
    revalidate_feature_tags(payload.id);
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}

export async function delete_feature_action(payload: DeleteFeaturePayload): Promise<ActionResult> {
  try {
    await features_repository.delete_feature(payload);
    revalidate_feature_tags(payload.id);
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}
