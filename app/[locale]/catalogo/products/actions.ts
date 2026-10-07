'use server';

import {
  bulk_delete_products_action,
  bulk_set_products_availability_action,
  create_product_action,
  delete_product_action,
  export_products_action,
  update_product_action,
  replace_product_images_action,
} from '@/server/domains/inventory/products/actions';
import {
  create_product_child_action,
  delete_product_child_action,
  update_product_child_action,
} from '@/server/domains/inventory/product-children/actions';
import {
  create_product_combo_action,
  delete_product_combo_action,
  update_product_combo_action,
} from '@/server/domains/inventory/product-combos/actions';
import type {
  CreateProductChildDto,
  UpdateProductChildPayload,
} from '@/server/domains/inventory/product-children/types';
import type {
  CreateProductComboDto,
  UpdateProductComboDto,
} from '@/server/domains/inventory/product-combos/types';
import {
  get_product_attributes_action,
  save_product_attributes_action,
} from '@/server/domains/catalog/product-attributes/actions';
import type {
  ProductAttributesDto,
  SaveProductAttributesDto,
} from '@/server/domains/catalog/product-attributes/types';
import type {
  CreateProductDto,
  ProductDto,
  ProductImageDto,
  ReplaceProductImagesDto,
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

export async function updateProductServerAction(payload: UpdateProductDto & { id: number }): Promise<ActionResult> {
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

// ─── Ficha técnica (Fase 4) ─────────────────────────────────────────────────

export async function getProductAttributesServerAction(
  productId: number,
): Promise<ActionResult<ProductAttributesDto>> {
  const result = await get_product_attributes_action(productId);
  return result.success ? { success: true, data: result.data } : fail(result.error, 'No se pudo cargar la ficha técnica');
}

export async function saveProductAttributesServerAction(
  productId: number,
  payload: SaveProductAttributesDto,
): Promise<ActionResult<ProductAttributesDto>> {
  const result = await save_product_attributes_action(productId, payload);
  return result.success ? { success: true, data: result.data } : fail(result.error, 'No se pudo guardar la ficha técnica');
}

// ─── Editor de producto (Fase 6): galería, variantes y componentes del combo ─

export async function replaceProductImagesServerAction(
  productId: number,
  payload: ReplaceProductImagesDto,
): Promise<ActionResult<ProductImageDto[]>> {
  const result = await replace_product_images_action({ ...payload, id: productId });
  return result.success ? { success: true, data: result.data } : fail(result.error, 'No se pudieron guardar las imágenes');
}

export async function createVariantServerAction(payload: CreateProductChildDto): Promise<ActionResult<{ id?: number }>> {
  const result = await create_product_child_action(payload);
  return result.success ? { success: true, data: result.data } : fail(result.error, 'No se pudo crear la variante');
}

export async function updateVariantServerAction(payload: UpdateProductChildPayload): Promise<ActionResult> {
  const result = await update_product_child_action(payload);
  return result.success ? { success: true } : fail(result.error, 'No se pudo actualizar la variante');
}

export async function deleteVariantServerAction(id: number): Promise<ActionResult> {
  const result = await delete_product_child_action({ id });
  return result.success ? { success: true } : fail(result.error, 'No se pudo eliminar la variante');
}

export async function createComboItemServerAction(payload: CreateProductComboDto): Promise<ActionResult<{ id?: number }>> {
  const result = await create_product_combo_action(payload);
  return result.success ? { success: true, data: result.data } : fail(result.error, 'No se pudo agregar el producto al combo');
}

export async function updateComboItemServerAction(payload: UpdateProductComboDto): Promise<ActionResult> {
  const result = await update_product_combo_action(payload);
  return result.success ? { success: true } : fail(result.error, 'No se pudo actualizar el combo');
}

export async function deleteComboItemServerAction(id: number): Promise<ActionResult> {
  const result = await delete_product_combo_action({ id });
  return result.success ? { success: true } : fail(result.error, 'No se pudo quitar el producto del combo');
}

