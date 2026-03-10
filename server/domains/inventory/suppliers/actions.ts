'use server';

import { revalidateTag } from 'next/cache';

import { suppliers_repository } from './repository';
import type {
  CreateSupplierDto,
  UpdateSupplierPayload,
  DeleteSupplierPayload,
} from './types';
import { suppliers_tags } from '@/server/lib/cache-tags';
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

function revalidate_supplier_tags(id: number) {
  revalidateTag(suppliers_tags.list());
  revalidateTag(suppliers_tags.item(id));
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function create_supplier_action(
  payload: CreateSupplierDto,
): Promise<ActionResult<{ id?: number }>> {
  try {
    const result = await suppliers_repository.create_supplier(payload);
    if (typeof result.id === 'number') {
      revalidate_supplier_tags(result.id);
    } else {
      revalidateTag(suppliers_tags.list());
    }
    return { success: true, data: { id: result.id } };
  } catch (error) {
    return handle_error(error);
  }
}

export async function update_supplier_action(
  payload: UpdateSupplierPayload,
): Promise<ActionResult> {
  try {
    const result = await suppliers_repository.update_supplier(payload);
    revalidate_supplier_tags(result.id ?? payload.id);
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}

export async function delete_supplier_action(
  payload: DeleteSupplierPayload,
): Promise<ActionResult> {
  try {
    await suppliers_repository.delete_supplier(payload);
    revalidate_supplier_tags(payload.id);
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}
