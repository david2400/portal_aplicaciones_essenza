'use server';

import {
  create_return_method_action,
  update_return_method_action,
  delete_return_method_action,
} from '@/server/domains/devolution/return-methods/actions';
import type {
  CreateReturnMethodDto,
  UpdateReturnMethodPayload,
} from '@/server/domains/devolution/return-methods/types';

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

export async function createReturnMethodServerAction(
  payload: CreateReturnMethodDto,
): Promise<ActionResult<{ id?: number }>> {
  const result = await create_return_method_action(payload);
  return result.success
    ? { success: true, data: result.data }
    : fail(result.error, 'No se pudo crear el registro');
}

export async function updateReturnMethodServerAction(payload: UpdateReturnMethodPayload): Promise<ActionResult> {
  const result = await update_return_method_action(payload);
  return result.success ? { success: true } : fail(result.error, 'No se pudo actualizar el registro');
}

export async function deleteReturnMethodServerAction(id: number): Promise<ActionResult> {
  const result = await delete_return_method_action({ id });
  return result.success ? { success: true } : fail(result.error, 'No se pudo eliminar el registro');
}
