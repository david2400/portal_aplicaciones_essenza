'use server';

import { revalidateTag } from 'next/cache';

import { brands_repository } from './repository';
import type { CreateBrandPayload, UpdateBrandPayload, DeleteBrandPayload } from './types';
import { brands_tags } from '@/server/lib/cache-tags';
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

function revalidate_brand_tag(id: number) {
  revalidateTag(brands_tags.item(id));
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function create_brand_action(
  payload: CreateBrandPayload,
): Promise<ActionResult<{ id?: number }>> {
  try {
    const result = await brands_repository.create_brand(payload);
    revalidateTag(brands_tags.list());
    if (result.id) {
      revalidate_brand_tag(result.id);
    }
    return { success: true, data: { id: result.id } };
  } catch (error) {
    return handle_error(error);
  }
}

export async function update_brand_action(
  payload: UpdateBrandPayload,
): Promise<ActionResult> {
  try {
    const result = await brands_repository.update_brand(payload);
    revalidate_brand_tag(result.id ?? payload.id);
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}

export async function delete_brand_action(
  payload: DeleteBrandPayload,
): Promise<ActionResult> {
  try {
    await brands_repository.delete_brand(payload);
    revalidate_brand_tag(payload.id);
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}
