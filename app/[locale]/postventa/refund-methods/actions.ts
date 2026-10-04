'use server';

import {
  create_refund_method_action,
  update_refund_method_action,
  delete_refund_method_action,
} from '@/server/domains/devolution/refund-methods/actions';
import type {
  CreateRefundMethodDto,
  UpdateRefundMethodPayload,
} from '@/server/domains/devolution/refund-methods/types';

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

export async function createRefundMethodServerAction(
  payload: CreateRefundMethodDto,
): Promise<ActionResult<{ id?: number }>> {
  const result = await create_refund_method_action(payload);
  return result.success
    ? { success: true, data: result.data }
    : fail(result.error, 'No se pudo crear el registro');
}

export async function updateRefundMethodServerAction(payload: UpdateRefundMethodPayload): Promise<ActionResult> {
  const result = await update_refund_method_action(payload);
  return result.success ? { success: true } : fail(result.error, 'No se pudo actualizar el registro');
}

export async function deleteRefundMethodServerAction(id: number): Promise<ActionResult> {
  const result = await delete_refund_method_action({ id });
  return result.success ? { success: true } : fail(result.error, 'No se pudo eliminar el registro');
}
