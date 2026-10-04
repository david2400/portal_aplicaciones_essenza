'use server';

import { revalidateTag } from 'next/cache';

import { subcategories_repository } from './repository';
import type {
  CreateSubcategoryPayload,
  UpdateSubcategoryPayload,
  DeleteSubcategoryPayload,
} from './types';
import { subcategories_tags } from '@/server/lib/cache-tags';
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

function revalidate_subcategory_tag(id: number) {
  revalidateTag(subcategories_tags.item(id));
  revalidateTag(subcategories_tags.list());
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function create_subcategory_action(
  payload: CreateSubcategoryPayload,
): Promise<ActionResult<{ id?: number }>> {
  try {
    const result = await subcategories_repository.create_subcategory(payload);
    revalidateTag(subcategories_tags.list());
    if (result.id) {
      revalidate_subcategory_tag(result.id);
    }
    return { success: true, data: { id: result.id } };
  } catch (error) {
    return handle_error(error);
  }
}

export async function update_subcategory_action(
  payload: UpdateSubcategoryPayload,
): Promise<ActionResult> {
  try {
    const result = await subcategories_repository.update_subcategory(payload);
    revalidate_subcategory_tag(result.id ?? payload.id);
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}

export async function delete_subcategory_action(
  payload: DeleteSubcategoryPayload,
): Promise<ActionResult> {
  try {
    await subcategories_repository.delete_subcategory(payload);
    revalidate_subcategory_tag(payload.id);
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}
