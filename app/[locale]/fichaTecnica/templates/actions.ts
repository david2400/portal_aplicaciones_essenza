'use server';

import {
  create_product_template_action,
  update_product_template_action,
  delete_product_template_action,
} from '@/server/domains/catalog/product-templates/actions';
import type { SaveProductTemplateDto } from '@/server/domains/catalog/product-templates/types';

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

export async function createProductTemplateServerAction(payload: SaveProductTemplateDto): Promise<ActionResult<{ id?: number }>> {
  const result = await create_product_template_action(payload);
  return result.success ? { success: true, data: result.data } : fail(result, 'No se pudo crear el registro');
}

export async function updateProductTemplateServerAction(id: number, payload: SaveProductTemplateDto): Promise<ActionResult> {
  const result = await update_product_template_action({ ...payload, id });
  return result.success ? { success: true } : fail(result, 'No se pudo actualizar el registro');
}

export async function deleteProductTemplateServerAction(id: number): Promise<ActionResult> {
  const result = await delete_product_template_action(id);
  return result.success ? { success: true } : fail(result, 'No se pudo eliminar el registro');
}
