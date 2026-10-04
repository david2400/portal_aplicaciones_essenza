'use server';

import {
  bulk_delete_brands_action,
  create_brand_action,
  delete_brand_action,
  export_brands_action,
  update_brand_action,
} from '@/server/domains/catalog/brands/actions';
import type { BrandDto } from '@/server/domains/catalog/brands/types';
import { parse_grid_query } from '@/server/lib/pagination';
import type { ActionResult, BulkResult } from '@/shared/models/pagination';
import { BRAND_GRID } from './grid';

/**
 * Server actions de la ruta. Devuelven el resultado en lugar de lanzar,
 * para que la UI muestre el motivo real del error (en producción Next.js
 * oculta el mensaje de las excepciones) y marque los campos inválidos.
 */
type BrandFormValues = { name: string; slug?: string; description?: string };

const fail = (
  result: { error?: string; fieldErrors?: Record<string, string> },
  fallback: string,
): ActionResult<never> => ({ success: false, error: result.error ?? fallback, fieldErrors: result.fieldErrors });

export async function createBrandServerAction(values: BrandFormValues): Promise<ActionResult<{ id?: number }>> {
  const result = await create_brand_action(values);
  return result.success ? { success: true, data: result.data } : fail(result, 'No se pudo crear la marca');
}

export async function updateBrandServerAction(id: number, values: BrandFormValues): Promise<ActionResult> {
  const result = await update_brand_action({ ...values, id });
  return result.success ? { success: true } : fail(result, 'No se pudo actualizar la marca');
}

export async function deleteBrandServerAction(id: number): Promise<ActionResult> {
  const result = await delete_brand_action({ id });
  return result.success ? { success: true } : fail(result, 'No se pudo eliminar la marca');
}

export async function bulkDeleteBrandsServerAction(ids: number[]): Promise<ActionResult<BulkResult>> {
  const result = await bulk_delete_brands_action(ids);
  return result.success ? { success: true, data: result.data } : fail(result, 'No se pudieron eliminar las marcas');
}

/** Exporta todas las marcas que cumplen la búsqueda actual (parámetros de la URL). */
export async function exportBrandsServerAction(
  params: Record<string, string>,
): Promise<ActionResult<{ items: BrandDto[]; truncated: boolean }>> {
  const result = await export_brands_action(parse_grid_query(params, BRAND_GRID));
  return result.success ? { success: true, data: result.data } : fail(result, 'No se pudo exportar');
}
