'use server';

import {
  bulk_delete_products_action,
  bulk_set_products_availability_action,
  create_product_action,
  delete_product_action,
  export_products_action,
  update_product_action,
} from '@/server/domains/inventory/products/actions';
import type {
  CreateProductDto,
  ProductDto,
  UpdateProductDto,
} from '@/server/domains/inventory/products/types';
import { parse_grid_query } from '@/server/lib/pagination';
import type { ActionResult, BulkResult } from '@/shared/models/pagination';
import { PRODUCT_GRID } from './grid';

/**
 * Server actions de la ruta. Devuelven el resultado en lugar de lanzar,
 * para que la UI pueda mostrar el motivo real del error.
 */
const fail = (error: string | undefined, fallback: string): ActionResult<never> => ({
  success: false,
  error: error ?? fallback,
});

export async function createProductServerAction(
  payload: CreateProductDto,
): Promise<ActionResult<{ id?: number }>> {
  const result = await create_product_action(payload);
  return result.success
    ? { success: true, data: result.data }
    : fail(result.error, 'No se pudo crear el producto');
}

export async function updateProductServerAction(payload: UpdateProductDto): Promise<ActionResult> {
  const result = await update_product_action(payload);
  return result.success ? { success: true } : fail(result.error, 'No se pudo actualizar el producto');
}

export async function deleteProductServerAction(id: number): Promise<ActionResult> {
  const result = await delete_product_action({ id });
  return result.success ? { success: true } : fail(result.error, 'No se pudo eliminar el producto');
}

export async function bulkDeleteProductsServerAction(ids: number[]): Promise<ActionResult<BulkResult>> {
  const result = await bulk_delete_products_action(ids);
  return result.success ? { success: true, data: result.data } : fail(result.error, 'No se pudieron eliminar los productos');
}

export async function bulkSetAvailabilityServerAction(
  ids: number[],
  available: boolean,
): Promise<ActionResult<BulkResult>> {
  const result = await bulk_set_products_availability_action(ids, available);
  return result.success ? { success: true, data: result.data } : fail(result.error, 'No se pudo actualizar la disponibilidad');
}

/** Exporta todos los productos que cumplen la búsqueda actual. */
export async function exportProductsServerAction(
  params: Record<string, string>,
): Promise<ActionResult<{ items: ProductDto[]; truncated: boolean }>> {
  const result = await export_products_action(parse_grid_query(params, PRODUCT_GRID));
  return result.success ? { success: true, data: result.data } : fail(result.error, 'No se pudo exportar');
}
