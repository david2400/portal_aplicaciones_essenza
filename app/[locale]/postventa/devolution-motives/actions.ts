'use server';

import {
  create_motive_devolution_action,
  update_motive_devolution_action,
  delete_motive_devolution_action,
} from '@/server/domains/devolution/motive-devolutions/actions';
import type {
  CreateMotiveDevolutionDto,
  UpdateMotiveDevolutionPayload,
} from '@/server/domains/devolution/motive-devolutions/types';

/**
 * Server actions de la ruta. Devuelven el resultado en lugar de lanzar,
 * para que el formulario pueda mostrar el motivo real del error (en
 * producción Next.js oculta el mensaje de las excepciones).
 */
type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

const fail = (error: string | undefined, fallback: string): ActionResult<never> => ({
  success: false,
  error: error ?? fallback,
});

export async function createMotiveDevolutionServerAction(
  payload: CreateMotiveDevolutionDto,
): Promise<ActionResult<{ id?: number }>> {
  const result = await create_motive_devolution_action(payload);
  return result.success
    ? { success: true, data: result.data }
    : fail(result.error, 'No se pudo crear el registro');
}

export async function updateMotiveDevolutionServerAction(payload: UpdateMotiveDevolutionPayload): Promise<ActionResult> {
  const result = await update_motive_devolution_action(payload);
  return result.success ? { success: true } : fail(result.error, 'No se pudo actualizar el registro');
}

export async function deleteMotiveDevolutionServerAction(id: number): Promise<ActionResult> {
  const result = await delete_motive_devolution_action({ id });
  return result.success ? { success: true } : fail(result.error, 'No se pudo eliminar el registro');
}
