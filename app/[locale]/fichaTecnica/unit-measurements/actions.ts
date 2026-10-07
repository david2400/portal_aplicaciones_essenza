'use server';

import {
  create_unit_action,
  delete_unit_action,
  update_unit_action,
} from '@/server/domains/product_details/unit-measurements/actions';
import type { SaveUnitDto, UnitDto, UpdateUnitPayload } from '@/server/domains/product_details/unit-measurements/types';

/**
 * Server actions de la ruta. Devuelven el resultado en lugar de lanzar,
 * para que el formulario pueda mostrar el motivo real del error.
 */
type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string };

const fail = (error: string | undefined, fallback: string): ActionResult<never> => ({
  success: false,
  error: error ?? fallback,
});

export async function createUnitServerAction(payload: SaveUnitDto): Promise<ActionResult<UnitDto>> {
  const result = await create_unit_action(payload);
  return result.success ? { success: true, data: result.data } : fail(result.error, 'No se pudo crear la unidad');
}

export async function updateUnitServerAction(payload: UpdateUnitPayload): Promise<ActionResult<UnitDto>> {
  const result = await update_unit_action(payload);
  return result.success ? { success: true, data: result.data } : fail(result.error, 'No se pudo actualizar la unidad');
}

export async function deleteUnitServerAction(id: number): Promise<ActionResult> {
  const result = await delete_unit_action(id);
  return result.success ? { success: true } : fail(result.error, 'No se pudo eliminar la unidad');
}
