'use server';

import { revalidateTag } from 'next/cache';

import { order_devolutions_repository } from './repository';
import { order_devolutions_resource } from './search';
import type { OrderDevolutionDto } from './types';
import type { BulkResult, GridQuery } from '@/shared/models/pagination';
import type {
  CreateOrderDevolutionDto,
  UpdateOrderDevolutionPayload,
  DeleteOrderDevolutionPayload,
} from './types';
import { order_devolutions_tags } from '@/server/lib/cache-tags';
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

function revalidate_order_devolution_tags(id?: number) {
  revalidateTag(order_devolutions_tags.list());
  if (typeof id === 'number') {
    revalidateTag(order_devolutions_tags.item(id));
  }
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function create_order_devolution_action(
  payload: CreateOrderDevolutionDto,
): Promise<ActionResult<{ id?: number }>> {
  try {
    const result = await order_devolutions_repository.create_order_devolution(payload);
    revalidate_order_devolution_tags(result.id);
    return { success: true, data: { id: result.id } };
  } catch (error) {
    return handle_error(error);
  }
}

export async function update_order_devolution_action(
  payload: UpdateOrderDevolutionPayload,
): Promise<ActionResult> {
  try {
    const result = await order_devolutions_repository.update_order_devolution(payload);
    revalidate_order_devolution_tags(result.id ?? payload.id);
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}

export async function delete_order_devolution_action(
  payload: DeleteOrderDevolutionPayload,
): Promise<ActionResult> {
  try {
    await order_devolutions_repository.delete_order_devolution(payload);
    revalidate_order_devolution_tags(payload.id);
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}

// ─── Lote y exportación ──────────────────────────────────────────────────────

export async function bulk_delete_order_devolutions_action(ids: number[]): Promise<ActionResult<BulkResult>> {
  try {
    const result = await order_devolutions_resource.bulk_delete(ids);
    revalidateTag(order_devolutions_tags.list());
    for (const id of ids) revalidateTag(order_devolutions_tags.item(id));
    return { success: true, data: result };
  } catch (error) {
    return handle_error(error);
  }
}

export async function export_order_devolutions_action(
  query: GridQuery,
): Promise<ActionResult<{ items: OrderDevolutionDto[]; truncated: boolean }>> {
  try {
    return { success: true, data: await order_devolutions_resource.export_all(query) };
  } catch (error) {
    return handle_error(error);
  }
}
