'use server';

import {
  create_feature_action,
  update_feature_action,
  delete_feature_action,
} from '@/server/domains/product_details/features/actions';
import type {
  CreateFeatureDto,
  UpdateFeatureDto,
} from '@/server/domains/product_details/features/types';

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

export async function createFeatureServerAction(
  payload: CreateFeatureDto,
): Promise<ActionResult<{ id?: number }>> {
  const result = await create_feature_action(payload);
  return result.success
    ? { success: true, data: result.data }
    : fail(result.error, 'No se pudo crear el registro');
}

export async function updateFeatureServerAction(payload: UpdateFeatureDto): Promise<ActionResult> {
  const result = await update_feature_action(payload);
  return result.success ? { success: true } : fail(result.error, 'No se pudo actualizar el registro');
}

export async function deleteFeatureServerAction(id: number): Promise<ActionResult> {
  const result = await delete_feature_action({ id });
  return result.success ? { success: true } : fail(result.error, 'No se pudo eliminar el registro');
}
