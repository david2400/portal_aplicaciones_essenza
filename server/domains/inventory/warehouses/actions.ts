'use server';

import { revalidateTag } from 'next/cache';

import { warehouses_repository } from './repository';
import type { CreateWarehouseDto, UpdateWarehousePayload } from './types';
import { warehouses_tags } from '@/server/lib/cache-tags';
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

function revalidate_warehouse_tags(id?: number) {
  revalidateTag(warehouses_tags.list());
  if (typeof id === 'number') {
    revalidateTag(warehouses_tags.item(id));
  }
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function create_warehouse_action(
  payload: CreateWarehouseDto,
): Promise<ActionResult<{ id?: number }>> {
  try {
    const result = await warehouses_repository.create_warehouse(payload);
    revalidate_warehouse_tags(result.id);
    return { success: true, data: { id: result.id } };
  } catch (error) {
    return handle_error(error);
  }
}

export async function update_warehouse_action(
  payload: UpdateWarehousePayload,
): Promise<ActionResult> {
  try {
    const result = await warehouses_repository.update_warehouse(payload);
    revalidate_warehouse_tags(result.id ?? payload.id);
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}
