'use server';

import {
  create_payment_method_action,
  update_payment_method_action,
  delete_payment_method_action,
} from '@/server/domains/sales/payment-methods/actions';
import type { SavePaymentMethodDto } from '@/server/domains/sales/payment-methods/types';

/**
 * Server actions de la ruta. Devuelven el resultado en lugar de lanzar para que
 * la UI muestre el motivo real del error (409 con pagos registrados, código repetido…).
 */
type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

const fail = (
  result: { error?: string; fieldErrors?: Record<string, string> },
  fallback: string,
): ActionResult<never> => ({ success: false, error: result.error ?? fallback, fieldErrors: result.fieldErrors });

export async function createPaymentMethodServerAction(payload: SavePaymentMethodDto): Promise<ActionResult<{ id?: number }>> {
  const result = await create_payment_method_action(payload);
  return result.success ? { success: true, data: result.data } : fail(result, 'No se pudo crear el medio de pago');
}

export async function updatePaymentMethodServerAction(id: number, payload: SavePaymentMethodDto): Promise<ActionResult> {
  const result = await update_payment_method_action({ ...payload, id });
  return result.success ? { success: true } : fail(result, 'No se pudo actualizar el medio de pago');
}

export async function deletePaymentMethodServerAction(id: number): Promise<ActionResult> {
  const result = await delete_payment_method_action(id);
  return result.success ? { success: true } : fail(result, 'No se pudo eliminar el medio de pago');
}

