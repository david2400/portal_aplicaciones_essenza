'use server';

import {
  create_warehouse_action,
  update_warehouse_action,
  delete_warehouse_action,
  bulk_delete_warehouses_action,
} from '@/server/domains/inventory/warehouses/actions';
import type {
  CreateWarehouseDto,
  UpdateWarehouseDto,
} from '@/server/domains/inventory/warehouses/types';
import type { BulkResult } from '@/shared/models/pagination';

/**
 * Server actions de la ruta. Devuelven el resultado en lugar de lanzar,
 * para que el formulario pueda mostrar el motivo real del error (en
 * producción Next.js oculta el mensaje de las excepciones).
 */
type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

const fail = (error: string | undefined, fallback: string): ActionResult<never> => ({
  success: false,
  error: error ?? fallback,
});

export async function createWarehouseServerAction(
  payload: CreateWarehouseDto,
): Promise<ActionResult<{ id?: number }>> {
  const result = await create_warehouse_action(payload);
  return result.success
    ? { success: true, data: result.data }
    : fail(result.error, 'No se pudo crear el registro');
}

export async function updateWarehouseServerAction(payload: UpdateWarehouseDto): Promise<ActionResult> {
  const result = await update_warehouse_action(payload);
  return result.success ? { success: true } : fail(result.error, 'No se pudo actualizar el registro');
}

export async function deleteWarehouseServerAction(id: number): Promise<ActionResult> {
  const result = await delete_warehouse_action(id);
  return result.success ? { success: true } : fail(result.error, 'No se pudo eliminar la bodega');
}

export async function bulkDeleteWarehousesServerAction(
  ids: number[],
): Promise<ActionResult<BulkResult>> {
  const result = await bulk_delete_warehouses_action(ids);
  return result.success ? { success: true, data: result.data } : fail(result.error, 'No se pudieron eliminar las bodegas');
}
