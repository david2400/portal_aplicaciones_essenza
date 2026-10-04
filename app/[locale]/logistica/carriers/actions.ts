'use server';

import {
  create_carrier_action,
  update_carrier_action,
  delete_carrier_action,
} from '@/server/domains/shipping_logistics/product_distribution/carriers/actions';
import type {
  CreateCarrierDto,
  UpdateCarrierPayload,
} from '@/server/domains/shipping_logistics/product_distribution/carriers/types';

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

export async function createCarrierServerAction(
  payload: CreateCarrierDto,
): Promise<ActionResult<{ id?: number }>> {
  const result = await create_carrier_action(payload);
  return result.success
    ? { success: true, data: result.data }
    : fail(result.error, 'No se pudo crear el registro');
}

export async function updateCarrierServerAction(payload: UpdateCarrierPayload): Promise<ActionResult> {
  const result = await update_carrier_action(payload);
  return result.success ? { success: true } : fail(result.error, 'No se pudo actualizar el registro');
}

export async function deleteCarrierServerAction(id: number): Promise<ActionResult> {
  const result = await delete_carrier_action(id);
  return result.success ? { success: true } : fail(result.error, 'No se pudo eliminar el registro');
}
