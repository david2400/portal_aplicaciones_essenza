'use server';

import {
  calculate_shipping_cost_action,
  delete_shipping_cost_action,
} from '@/server/domains/shipping_logistics/product_distribution/shipping-costs/actions';
import type {
  CalculateShippingCostParams,
  ShippingCostDto,
} from '@/server/domains/shipping_logistics/product_distribution/shipping-costs/types';

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

/** Calcula (y guarda) el costo de un envío con la tarifa de la transportadora. */
export async function calculateShippingCostServerAction(
  params: CalculateShippingCostParams,
): Promise<ActionResult<ShippingCostDto>> {
  const result = await calculate_shipping_cost_action(params);
  return result.success
    ? { success: true, data: result.data.shipping_cost }
    : fail(result.error, 'No se pudo calcular el costo de envío');
}

export async function deleteShippingCostServerAction(id: number): Promise<ActionResult> {
  const result = await delete_shipping_cost_action(id);
  return result.success ? { success: true } : fail(result.error, 'No se pudo eliminar el registro');
}
