'use server';

import {
  bulk_delete_subcategories_action,
  create_subcategory_action,
  delete_subcategory_action,
  export_subcategories_action,
  update_subcategory_action,
} from '@/server/domains/catalog/subcategories/actions';
import type { SubcategoryDto } from '@/server/domains/catalog/subcategories/types';
import { parse_grid_query } from '@/server/lib/pagination';
import type { ActionResult, BulkResult } from '@/shared/models/pagination';
import { SUBCATEGORY_GRID } from './grid';

/**
 * Server actions de la ruta. Devuelven el resultado en lugar de lanzar,
 * para que la UI muestre el motivo real del error (en producción Next.js
 * oculta el mensaje de las excepciones) y marque los campos inválidos.
 */
type SubcategoryFormValues = { name: string; slug?: string; description?: string; category_id?: number };

const fail = (
  result: { error?: string; fieldErrors?: Record<string, string> },
  fallback: string,
): ActionResult<never> => ({ success: false, error: result.error ?? fallback, fieldErrors: result.fieldErrors });

const missingCategory = (): ActionResult<never> => ({
  success: false,
  error: 'Selecciona la categoría a la que pertenece la subcategoría.',
  fieldErrors: { category_id: 'Selecciona una categoría' },
});

export async function createSubcategoryServerAction(values: SubcategoryFormValues): Promise<ActionResult<{ id?: number }>> {
  if (!values.category_id) return missingCategory();
  const result = await create_subcategory_action({ ...values, category_id: values.category_id });
  return result.success ? { success: true, data: result.data } : fail(result, 'No se pudo crear la subcategoría');
}

export async function updateSubcategoryServerAction(id: number, values: SubcategoryFormValues): Promise<ActionResult> {
  if (!values.category_id) return missingCategory();
  const result = await update_subcategory_action({ ...values, category_id: values.category_id, id });
  return result.success ? { success: true } : fail(result, 'No se pudo actualizar la subcategoría');
}

export async function deleteSubcategoryServerAction(id: number): Promise<ActionResult> {
  const result = await delete_subcategory_action({ id });
  return result.success ? { success: true } : fail(result, 'No se pudo eliminar la subcategoría');
}

export async function bulkDeleteSubcategoriesServerAction(ids: number[]): Promise<ActionResult<BulkResult>> {
  const result = await bulk_delete_subcategories_action(ids);
  return result.success ? { success: true, data: result.data } : fail(result, 'No se pudieron eliminar las subcategorías');
}

/** Exporta todas las subcategorías que cumplen la búsqueda actual (parámetros de la URL). */
export async function exportSubcategoriesServerAction(
  params: Record<string, string>,
): Promise<ActionResult<{ items: SubcategoryDto[]; truncated: boolean }>> {
  const result = await export_subcategories_action(parse_grid_query(params, SUBCATEGORY_GRID));
  return result.success ? { success: true, data: result.data } : fail(result, 'No se pudo exportar');
}
