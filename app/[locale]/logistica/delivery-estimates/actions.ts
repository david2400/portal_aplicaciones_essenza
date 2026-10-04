'use server';

import {
  calculate_delivery_estimate_action,
  delete_delivery_estimate_action,
} from '@/server/domains/shipping_logistics/product_distribution/delivery-estimates/actions';
import type {
  CalculateDeliveryEstimateParams,
  DeliveryEstimateDto,
} from '@/server/domains/shipping_logistics/product_distribution/delivery-estimates/types';

/**
 * Server actions de la ruta. Devuelven el resultado en lugar de lanzar,
 * para que la UI pueda mostrar el motivo real del error.
 */
type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

const fail = (error: string | undefined, fallback: string): ActionResult<never> => ({
  success: false,
  error: error ?? fallback,
});

/** Calcula (y guarda) la fecha estimada de entrega de un envío. */
export async function calculateDeliveryEstimateServerAction(
  params: CalculateDeliveryEstimateParams,
): Promise<ActionResult<DeliveryEstimateDto>> {
  const result = await calculate_delivery_estimate_action(params);
  return result.success
    ? { success: true, data: result.data.delivery_estimate }
    : fail(result.error, 'No se pudo calcular la fecha de entrega');
}

export async function deleteDeliveryEstimateServerAction(id: number): Promise<ActionResult> {
  const result = await delete_delivery_estimate_action(id);
  return result.success ? { success: true } : fail(result.error, 'No se pudo eliminar el registro');
}
