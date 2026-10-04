'use server';

import {
  create_type_product_action,
  update_type_product_action,
  delete_type_product_action,
} from '@/server/domains/product_details/type-products/actions';
import type {
  CreateTypeProductDto,
  UpdateTypeProductDto,
} from '@/server/domains/product_details/type-products/types';

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

export async function createTypeProductServerAction(
  payload: CreateTypeProductDto,
): Promise<ActionResult<{ id?: number }>> {
  const result = await create_type_product_action(payload);
  return result.success
    ? { success: true, data: result.data }
    : fail(result.error, 'No se pudo crear el registro');
}

export async function updateTypeProductServerAction(payload: UpdateTypeProductDto): Promise<ActionResult> {
  const result = await update_type_product_action(payload);
  return result.success ? { success: true } : fail(result.error, 'No se pudo actualizar el registro');
}

export async function deleteTypeProductServerAction(id: number): Promise<ActionResult> {
  const result = await delete_type_product_action({ id });
  return result.success ? { success: true } : fail(result.error, 'No se pudo eliminar el registro');
}
