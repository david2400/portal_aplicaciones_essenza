'use server';

import {
  create_payment_type_action,
  update_payment_type_action,
  delete_payment_type_action,
} from '@/server/domains/sales/payment-types/actions';
import type {
  CreatePaymentTypeDto,
  UpdatePaymentTypeDto,
} from '@/server/domains/sales/payment-types/types';

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

export async function createPaymentTypeServerAction(
  payload: CreatePaymentTypeDto,
): Promise<ActionResult<{ id?: number }>> {
  const result = await create_payment_type_action(payload);
  return result.success
    ? { success: true, data: result.data }
    : fail(result.error, 'No se pudo crear el registro');
}

export async function updatePaymentTypeServerAction(payload: UpdatePaymentTypeDto): Promise<ActionResult> {
  const result = await update_payment_type_action(payload);
  return result.success ? { success: true } : fail(result.error, 'No se pudo actualizar el registro');
}

export async function deletePaymentTypeServerAction(id: number): Promise<ActionResult> {
  const result = await delete_payment_type_action({ id });
  return result.success ? { success: true } : fail(result.error, 'No se pudo eliminar el registro');
}
