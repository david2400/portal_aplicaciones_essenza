'use server';

import { parse_grid_query } from '@/server/lib/pagination';
import type { BulkResult } from '@/shared/models/pagination';
import { SUPPLIER_GRID } from './grid';
import {
  bulk_delete_suppliers_action,
  change_supplier_status_action,
  create_supplier_action,
  delete_supplier_action,
  delete_supplier_product_action,
  export_suppliers_action,
  save_supplier_product_action,
  update_supplier_action,
} from '@/server/domains/inventory/suppliers/actions';
import type {
  ChangeSupplierStatusDto,
  SaveSupplierDto,
  SaveSupplierProductDto,
  SupplierDto,
  SupplierProductDto,
} from '@/server/domains/inventory/suppliers/types';

/**
 * Server actions de la ruta. Devuelven el resultado en lugar de lanzar,
 * para que el formulario pueda mostrar el motivo real del error (en
 * producción Next.js oculta el mensaje de las excepciones).
 */
type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

const fail = (
  error: string | undefined,
  fallback: string,
  fieldErrors?: Record<string, string>,
): ActionResult<never> => ({
  success: false,
  error: error ?? fallback,
  fieldErrors,
});

export async function createSupplierServerAction(payload: SaveSupplierDto): Promise<ActionResult<SupplierDto>> {
  const result = await create_supplier_action(payload);
  return result.success
    ? { success: true, data: result.data }
    : fail(result.error, 'No se pudo crear el proveedor', result.field_errors);
}

export async function updateSupplierServerAction(id: number, payload: SaveSupplierDto): Promise<ActionResult<SupplierDto>> {
  const result = await update_supplier_action({ ...payload, id });
  return result.success
    ? { success: true, data: result.data }
    : fail(result.error, 'No se pudo actualizar el proveedor', result.field_errors);
}

export async function changeSupplierStatusServerAction(
  id: number,
  payload: ChangeSupplierStatusDto,
): Promise<ActionResult<SupplierDto>> {
  const result = await change_supplier_status_action(id, payload);
  return result.success ? { success: true, data: result.data } : fail(result.error, 'No se pudo cambiar el estado');
}

export async function deleteSupplierServerAction(id: number): Promise<ActionResult> {
  const result = await delete_supplier_action({ id });
  return result.success ? { success: true } : fail(result.error, 'No se pudo eliminar el proveedor');
}

export async function bulkDeleteSuppliersServerAction(ids: number[]): Promise<ActionResult<BulkResult>> {
  const result = await bulk_delete_suppliers_action(ids);
  return result.success ? { success: true, data: result.data } : fail(result.error, 'No se pudieron eliminar los proveedores');
}

/** Exporta todos los proveedores que cumplen la búsqueda actual. */
export async function exportSuppliersServerAction(
  params: Record<string, string>,
): Promise<ActionResult<{ items: SupplierDto[]; truncated: boolean }>> {
  const result = await export_suppliers_action(parse_grid_query(params, SUPPLIER_GRID));
  return result.success ? { success: true, data: result.data } : fail(result.error, 'No se pudo exportar');
}

export async function saveSupplierProductServerAction(
  supplierId: number,
  productId: number | null,
  payload: SaveSupplierProductDto,
): Promise<ActionResult<SupplierProductDto>> {
  const result = await save_supplier_product_action(supplierId, productId, payload);
  return result.success ? { success: true, data: result.data } : fail(result.error, 'No se pudo guardar el producto');
}

export async function deleteSupplierProductServerAction(supplierId: number, productId: number): Promise<ActionResult> {
  const result = await delete_supplier_product_action(supplierId, productId);
  return result.success ? { success: true } : fail(result.error, 'No se pudo quitar el producto');
}
