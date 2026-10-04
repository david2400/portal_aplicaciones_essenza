'use server';

import { revalidateTag } from 'next/cache';

import { payment_types_repository } from './repository';
import type { CreatePaymentTypePayload, UpdatePaymentTypePayload, DeletePaymentTypePayload } from './types';
import { payment_types_tags } from '@/server/lib/cache-tags';
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

function revalidate_payment_types(id?: number) {
  revalidateTag(payment_types_tags.list());
  if (id != null) {
    revalidateTag(payment_types_tags.item(id));
  }
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function create_payment_type_action(
  payload: CreatePaymentTypePayload,
): Promise<ActionResult<{ id?: number }>> {
  try {
    const result = await payment_types_repository.create_payment_type(payload);
    revalidate_payment_types(result.id);
    return { success: true, data: { id: result.id } };
  } catch (error) {
    return handle_error(error);
  }
}

export async function update_payment_type_action(payload: UpdatePaymentTypePayload): Promise<ActionResult> {
  try {
    await payment_types_repository.update_payment_type(payload);
    revalidate_payment_types(payload.id);
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}

export async function delete_payment_type_action(payload: DeletePaymentTypePayload): Promise<ActionResult> {
  try {
    await payment_types_repository.delete_payment_type(payload);
    revalidate_payment_types(payload.id);
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}
