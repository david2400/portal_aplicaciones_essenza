'use server';

import { revalidateTag } from 'next/cache';

import { unit_measurements_repository } from './repository';
import type { CreateUnitMeasurementDto, UpdateUnitMeasurementPayload } from './types';
import { unit_measurements_tags } from '@/server/lib/cache-tags';
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

export async function create_unit_measurement_action(
  payload: CreateUnitMeasurementDto,
): Promise<ActionResult<{ id: number }>> {
  try {
    const result = await unit_measurements_repository.create_unit_measurement(payload);
    const id = result.id;
    if (typeof id !== 'number') {
      return { success: false, error: 'unit_measurement_id_not_returned' };
    }
    revalidateTag(unit_measurements_tags.list());
    revalidateTag(unit_measurements_tags.item(id));
    return { success: true, data: { id } };
  } catch (error) {
    return handle_error(error);
  }
}

export async function update_unit_measurement_action(
  payload: UpdateUnitMeasurementPayload,
): Promise<ActionResult> {
  try {
    await unit_measurements_repository.update_unit_measurement(payload);
    revalidateTag(unit_measurements_tags.list());
    revalidateTag(unit_measurements_tags.item(payload.id));
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}

export async function delete_unit_measurement_action(id: number): Promise<ActionResult> {
  try {
    await unit_measurements_repository.delete_unit_measurement(id);
    revalidateTag(unit_measurements_tags.list());
    revalidateTag(unit_measurements_tags.item(id));
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}
