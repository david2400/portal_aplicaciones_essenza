'use server';

import { revalidateTag } from 'next/cache';

import { payment_types_repository } from './repository';
import type { CreatePaymentTypeDto } from './types';
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

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function create_payment_type_action(
  payload: CreatePaymentTypeDto,
): Promise<ActionResult<{ id?: number }>> {
  try {
    const result = await payment_types_repository.create_payment_type(payload);
    revalidateTag(payment_types_tags.list());
    return { success: true, data: { id: result.id } };
  } catch (error) {
    return handle_error(error);
  }
}
