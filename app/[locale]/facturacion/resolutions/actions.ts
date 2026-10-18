'use server';

import {
  create_resolution_action,
  delete_resolution_action,
  update_resolution_action,
} from '@/server/domains/billing/resolutions/actions';
import type { ResolutionDto, SaveResolutionDto } from '@/server/domains/billing/resolutions/types';

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

const fail = (result: { error?: string }, fallback: string): ActionResult<never> => ({
  success: false,
  error: result.error ?? fallback,
});

export async function createResolutionServerAction(payload: SaveResolutionDto): Promise<ActionResult<ResolutionDto>> {
  const result = await create_resolution_action(payload);
  return result.success ? { success: true, data: result.data } : fail(result, 'No se pudo crear la numeración');
}

export async function updateResolutionServerAction(id: number, payload: SaveResolutionDto): Promise<ActionResult<ResolutionDto>> {
  const result = await update_resolution_action(id, payload);
  return result.success ? { success: true, data: result.data } : fail(result, 'No se pudo actualizar la numeración');
}

export async function deleteResolutionServerAction(id: number): Promise<ActionResult> {
  const result = await delete_resolution_action(id);
  return result.success ? { success: true, data: undefined } : fail(result, 'No se pudo eliminar la numeración');
}
