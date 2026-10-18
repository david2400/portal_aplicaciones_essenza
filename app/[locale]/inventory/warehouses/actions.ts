'use server';

import { parse_grid_query } from '@/server/lib/pagination';
import type { BulkResult } from '@/shared/models/pagination';
import { WAREHOUSE_GRID } from './grid';
import {
  bulk_delete_warehouses_action,
  create_warehouse_action,
  delete_location_action,
  delete_warehouse_action,
  export_warehouses_action,
  save_location_action,
  set_main_warehouse_action,
  set_warehouse_active_action,
  update_min_threshold_action,
  update_warehouse_action,
} from '@/server/domains/inventory/warehouses/actions';
import type {
  SaveLocationDto,
  SaveWarehouseDto,
  WarehouseDto,
  WarehouseLocationDto,
  WarehouseStockDto,
} from '@/server/domains/inventory/warehouses/types';

/**
 * Server actions de la ruta. Devuelven el resultado en lugar de lanzar, para que la UI
 * muestre el motivo real del error (en producción Next.js oculta el mensaje de las excepciones).
 */
type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

const fail = (error: string | undefined, fallback: string, fieldErrors?: Record<string, string>): ActionResult<never> => ({
  success: false,
  error: error ?? fallback,
  fieldErrors,
});

export async function createWarehouseServerAction(payload: SaveWarehouseDto): Promise<ActionResult<WarehouseDto>> {
  const result = await create_warehouse_action(payload);
  return result.success ? { success: true, data: result.data } : fail(result.error, 'No se pudo crear la bodega', result.field_errors);
}

export async function updateWarehouseServerAction(id: number, payload: SaveWarehouseDto): Promise<ActionResult<WarehouseDto>> {
  const result = await update_warehouse_action({ ...payload, id });
  return result.success
    ? { success: true, data: result.data }
    : fail(result.error, 'No se pudo actualizar la bodega', result.field_errors);
}

export async function setWarehouseActiveServerAction(id: number, active: boolean): Promise<ActionResult<WarehouseDto>> {
  const result = await set_warehouse_active_action(id, active);
  return result.success ? { success: true, data: result.data } : fail(result.error, 'No se pudo cambiar el estado');
}

export async function setMainWarehouseServerAction(id: number): Promise<ActionResult<WarehouseDto>> {
  const result = await set_main_warehouse_action(id);
  return result.success ? { success: true, data: result.data } : fail(result.error, 'No se pudo marcar como principal');
}

export async function deleteWarehouseServerAction(id: number): Promise<ActionResult> {
  const result = await delete_warehouse_action(id);
  return result.success ? { success: true } : fail(result.error, 'No se pudo eliminar la bodega');
}

export async function bulkDeleteWarehousesServerAction(ids: number[]): Promise<ActionResult<BulkResult>> {
  const result = await bulk_delete_warehouses_action(ids);
  return result.success ? { success: true, data: result.data } : fail(result.error, 'No se pudieron eliminar las bodegas');
}

/** Exporta todas las bodegas que cumplen la búsqueda actual. */
export async function exportWarehousesServerAction(
  params: Record<string, string>,
): Promise<ActionResult<{ items: WarehouseDto[]; truncated: boolean }>> {
  const result = await export_warehouses_action(parse_grid_query(params, WAREHOUSE_GRID));
  return result.success ? { success: true, data: result.data } : fail(result.error, 'No se pudo exportar');
}

export async function updateMinThresholdServerAction(
  id: number,
  skuId: number,
  minThreshold: number,
): Promise<ActionResult<WarehouseStockDto>> {
  const result = await update_min_threshold_action(id, skuId, minThreshold);
  return result.success ? { success: true, data: result.data } : fail(result.error, 'No se pudo guardar el mínimo');
}

export async function saveLocationServerAction(
  id: number,
  locationId: number | null,
  payload: SaveLocationDto,
): Promise<ActionResult<WarehouseLocationDto>> {
  const result = await save_location_action(id, locationId, payload);
  return result.success ? { success: true, data: result.data } : fail(result.error, 'No se pudo guardar la ubicación');
}

export async function deleteLocationServerAction(id: number, locationId: number): Promise<ActionResult> {
  const result = await delete_location_action(id, locationId);
  return result.success ? { success: true } : fail(result.error, 'No se pudo quitar la ubicación');
}
