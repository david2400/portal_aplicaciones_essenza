'use server';

import {
  create_category_action,
  update_category_action,
  delete_category_action,
} from '@/server/domains/catalog/categories/actions';
import type {
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@/server/domains/catalog/categories/types';

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

export async function createCategoryServerAction(
  payload: CreateCategoryDto,
): Promise<ActionResult<{ id?: number }>> {
  const result = await create_category_action(payload);
  return result.success
    ? { success: true, data: result.data }
    : fail(result.error, 'No se pudo crear el registro');
}

export async function updateCategoryServerAction(payload: UpdateCategoryDto): Promise<ActionResult> {
  const result = await update_category_action(payload);
  return result.success ? { success: true } : fail(result.error, 'No se pudo actualizar el registro');
}

export async function deleteCategoryServerAction(id: number): Promise<ActionResult> {
  const result = await delete_category_action({ id });
  return result.success ? { success: true } : fail(result.error, 'No se pudo eliminar el registro');
}
