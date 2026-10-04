'use server';

import {
  create_page_action,
  update_page_action,
  delete_page_action,
} from '@/server/domains/cms/pages/actions';
import type { CreatePageDto, UpdatePagePayload } from '@/server/domains/cms/pages/types';

/**
 * Server actions de la ruta. Devuelven el resultado en lugar de lanzar,
 * para que la UI pueda mostrar el motivo real del error (p. ej. slug repetido).
 */
type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

const fail = (error: string | undefined, fallback: string): ActionResult<never> => ({
  success: false,
  error: error ?? fallback,
});

export async function createPageServerAction(
  payload: CreatePageDto,
): Promise<ActionResult<{ id?: number }>> {
  const result = await create_page_action(payload);
  return result.success
    ? { success: true, data: result.data }
    : fail(result.error, 'No se pudo crear la página');
}

/** El PUT del CMS es parcial: se pueden enviar solo los campos que cambian. */
export async function updatePageServerAction(payload: UpdatePagePayload): Promise<ActionResult> {
  const result = await update_page_action(payload);
  return result.success ? { success: true } : fail(result.error, 'No se pudo actualizar la página');
}

export async function deletePageServerAction(id: number): Promise<ActionResult> {
  const result = await delete_page_action({ id });
  return result.success ? { success: true } : fail(result.error, 'No se pudo eliminar la página');
}
