'use server';

import {
  create_personalization_profile_action,
  update_personalization_profile_action,
  delete_personalization_profile_action,
} from '@/server/domains/advanced_features/personalization-profiles/actions';
import type {
  CreatePersonalizationProfileDto,
  UpdatePersonalizationProfilePayload,
} from '@/server/domains/advanced_features/personalization-profiles/types';

/**
 * Server actions de la ruta. Devuelven el resultado en lugar de lanzar,
 * para que la UI pueda mostrar el motivo real del error.
 */
type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

const fail = (error: string | undefined, fallback: string): ActionResult<never> => ({
  success: false,
  error: error ?? fallback,
});

export async function createProfileServerAction(
  payload: CreatePersonalizationProfileDto,
): Promise<ActionResult<{ id?: number }>> {
  const result = await create_personalization_profile_action(payload);
  return result.success
    ? { success: true, data: result.data }
    : fail(result.error, 'No se pudo crear el perfil');
}

export async function updateProfileServerAction(
  payload: UpdatePersonalizationProfilePayload,
): Promise<ActionResult> {
  const result = await update_personalization_profile_action(payload);
  return result.success ? { success: true } : fail(result.error, 'No se pudo actualizar el perfil');
}

export async function deleteProfileServerAction(id: number): Promise<ActionResult> {
  const result = await delete_personalization_profile_action({ id });
  return result.success ? { success: true } : fail(result.error, 'No se pudo eliminar el perfil');
}
