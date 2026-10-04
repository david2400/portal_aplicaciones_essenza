'use server';

import {
  create_unit_measurement_action,
  update_unit_measurement_action,
  delete_unit_measurement_action,
} from '@/server/domains/product_details/unit-measurements/actions';
import type {
  CreateUnitMeasurementDto,
  UpdateUnitMeasurementDto,
} from '@/server/domains/product_details/unit-measurements/types';

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

export async function createUnitMeasurementServerAction(
  payload: CreateUnitMeasurementDto,
): Promise<ActionResult<{ id?: number }>> {
  const result = await create_unit_measurement_action(payload);
  return result.success
    ? { success: true, data: result.data }
    : fail(result.error, 'No se pudo crear el registro');
}

export async function updateUnitMeasurementServerAction(payload: UpdateUnitMeasurementDto): Promise<ActionResult> {
  const result = await update_unit_measurement_action(payload);
  return result.success ? { success: true } : fail(result.error, 'No se pudo actualizar el registro');
}

export async function deleteUnitMeasurementServerAction(id: number): Promise<ActionResult> {
  const result = await delete_unit_measurement_action(id);
  return result.success ? { success: true } : fail(result.error, 'No se pudo eliminar el registro');
}
