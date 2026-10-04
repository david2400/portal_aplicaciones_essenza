'use server';

import {
  create_product_combo_action,
  update_product_combo_action,
  delete_product_combo_action,
} from '@/server/domains/inventory/product-combos/actions';
import type {
  CreateProductComboDto,
  UpdateProductComboDto,
} from '@/server/domains/inventory/product-combos/types';

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

export async function createComboServerAction(
  payload: CreateProductComboDto,
): Promise<ActionResult<{ id?: number }>> {
  const result = await create_product_combo_action(payload);
  return result.success
    ? { success: true, data: result.data }
    : fail(result.error, 'No se pudo crear el registro');
}

export async function updateComboServerAction(payload: UpdateProductComboDto): Promise<ActionResult> {
  const result = await update_product_combo_action(payload);
  return result.success ? { success: true } : fail(result.error, 'No se pudo actualizar el registro');
}

export async function deleteComboServerAction(id: number): Promise<ActionResult> {
  const result = await delete_product_combo_action({ id });
  return result.success ? { success: true } : fail(result.error, 'No se pudo eliminar el registro');
}
