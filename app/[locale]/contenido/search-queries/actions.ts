'use server';

import { delete_search_query_action } from '@/server/domains/smart_search/queries/actions';

/**
 * Server actions de la ruta. Las búsquedas las registra la tienda; desde el
 * panel solo se consultan y se depuran.
 */
type ActionResult = { success: true } | { success: false; error: string };

export async function deleteSearchQueryServerAction(id: number): Promise<ActionResult> {
  const result = await delete_search_query_action({ id });
  return result.success
    ? { success: true }
    : { success: false, error: result.error ?? 'No se pudo eliminar la búsqueda' };
}
