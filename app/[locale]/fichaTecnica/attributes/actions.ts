'use server';

import {
  create_attribute_action,
  update_attribute_action,
  delete_attribute_action,
} from '@/server/domains/catalog/attributes/actions';
import type { SaveAttributeDto } from '@/server/domains/catalog/attributes/types';

/**
 * Server actions de la ruta. Devuelven el resultado en lugar de lanzar para que
 * el formulario muestre el motivo real del error (409 en uso, código repetido…).
 */
type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

const fail = (
  result: { error?: string; fieldErrors?: Record<string, string> },
  fallback: string,
): ActionResult<never> => ({ success: false, error: result.error ?? fallback, fieldErrors: result.fieldErrors });

export async function createAttributeServerAction(payload: SaveAttributeDto): Promise<ActionResult<{ id?: number }>> {
  const result = await create_attribute_action(payload);
  return result.success ? { success: true, data: result.data } : fail(result, 'No se pudo crear el registro');
}

export async function updateAttributeServerAction(id: number, payload: SaveAttributeDto): Promise<ActionResult> {
  const result = await update_attribute_action({ ...payload, id });
  return result.success ? { success: true } : fail(result, 'No se pudo actualizar el registro');
}

export async function deleteAttributeServerAction(id: number): Promise<ActionResult> {
  const result = await delete_attribute_action(id);
  return result.success ? { success: true } : fail(result, 'No se pudo eliminar el registro');
}
