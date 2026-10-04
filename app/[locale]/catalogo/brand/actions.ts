'use server';

import {
  create_brand_action,
  update_brand_action,
  delete_brand_action,
} from '@/server/domains/catalog/brands/actions';
import type {
  CreateBrandDto,
  UpdateBrandDto,
} from '@/server/domains/catalog/brands/types';

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

export async function createBrandServerAction(
  payload: CreateBrandDto,
): Promise<ActionResult<{ id?: number }>> {
  const result = await create_brand_action(payload);
  return result.success
    ? { success: true, data: result.data }
    : fail(result.error, 'No se pudo crear el registro');
}

export async function updateBrandServerAction(payload: UpdateBrandDto): Promise<ActionResult> {
  const result = await update_brand_action(payload);
  return result.success ? { success: true } : fail(result.error, 'No se pudo actualizar el registro');
}

export async function deleteBrandServerAction(id: number): Promise<ActionResult> {
  const result = await delete_brand_action({ id });
  return result.success ? { success: true } : fail(result.error, 'No se pudo eliminar el registro');
}
