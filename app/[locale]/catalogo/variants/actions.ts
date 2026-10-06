'use server';

import {
  create_product_child_action,
  update_product_child_action,
  delete_product_child_action,
  bulk_delete_product_children_action,
} from '@/server/domains/inventory/product-children/actions';
import type {
  CreateProductChildDto,
  UpdateProductChildPayload,
} from '@/server/domains/inventory/product-children/types';
import type { BulkResult } from '@/shared/models/pagination';

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string };

const fail = (error: string | undefined, fallback: string): ActionResult<never> => ({
  success: false,
  error: error ?? fallback,
});

export async function createProductChildServerAction(
  payload: CreateProductChildDto,
): Promise<ActionResult<{ id?: number }>> {
  const result = await create_product_child_action(payload);
  return result.success ? { success: true, data: result.data } : fail(result.error, 'No se pudo crear la variante');
}

export async function updateProductChildServerAction(payload: UpdateProductChildPayload): Promise<ActionResult> {
  const result = await update_product_child_action(payload);
  return result.success ? { success: true } : fail(result.error, 'No se pudo actualizar la variante');
}

export async function deleteProductChildServerAction(id: number): Promise<ActionResult> {
  const result = await delete_product_child_action({ id });
  return result.success ? { success: true } : fail(result.error, 'No se pudo eliminar la variante');
}

export async function bulkDeleteProductChildrenServerAction(ids: number[]): Promise<ActionResult<BulkResult>> {
  const result = await bulk_delete_product_children_action(ids);
  return result.success
    ? { success: true, data: result.data }
    : fail(result.error, 'No se pudieron eliminar las variantes');
}
