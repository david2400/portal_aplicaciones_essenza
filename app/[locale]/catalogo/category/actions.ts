'use server';

import {
  bulk_delete_categories_action,
  create_category_action,
  delete_category_action,
  export_categories_action,
  update_category_action,
} from '@/server/domains/catalog/categories/actions';
import type { CategoryDto } from '@/server/domains/catalog/categories/types';
import { parse_grid_query } from '@/server/lib/pagination';
import type { ActionResult, BulkResult } from '@/shared/models/pagination';
import { CATEGORY_GRID } from './grid';

/**
 * Server actions de la ruta. Devuelven el resultado en lugar de lanzar,
 * para que la UI muestre el motivo real del error (en producción Next.js
 * oculta el mensaje de las excepciones) y marque los campos inválidos.
 */
type CategoryFormValues = { name: string; slug?: string; description?: string };

const fail = (
  result: { error?: string; fieldErrors?: Record<string, string> },
  fallback: string,
): ActionResult<never> => ({ success: false, error: result.error ?? fallback, fieldErrors: result.fieldErrors });

export async function createCategoryServerAction(values: CategoryFormValues): Promise<ActionResult<{ id?: number }>> {
  const result = await create_category_action(values);
  return result.success ? { success: true, data: result.data } : fail(result, 'No se pudo crear la categoría');
}

export async function updateCategoryServerAction(id: number, values: CategoryFormValues): Promise<ActionResult> {
  const result = await update_category_action({ ...values, id });
  return result.success ? { success: true } : fail(result, 'No se pudo actualizar la categoría');
}

export async function deleteCategoryServerAction(id: number): Promise<ActionResult> {
  const result = await delete_category_action({ id });
  return result.success ? { success: true } : fail(result, 'No se pudo eliminar la categoría');
}

export async function bulkDeleteCategoriesServerAction(ids: number[]): Promise<ActionResult<BulkResult>> {
  const result = await bulk_delete_categories_action(ids);
  return result.success ? { success: true, data: result.data } : fail(result, 'No se pudieron eliminar las categorías');
}

/** Exporta todas las categorías que cumplen la búsqueda actual (parámetros de la URL). */
export async function exportCategoriesServerAction(
  params: Record<string, string>,
): Promise<ActionResult<{ items: CategoryDto[]; truncated: boolean }>> {
  const result = await export_categories_action(parse_grid_query(params, CATEGORY_GRID));
  return result.success ? { success: true, data: result.data } : fail(result, 'No se pudo exportar');
}
