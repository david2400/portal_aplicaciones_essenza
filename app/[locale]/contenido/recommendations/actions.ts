'use server';

import {
  create_product_recommendation_action,
  update_product_recommendation_action,
  delete_product_recommendation_action,
} from '@/server/domains/recommendations/products/actions';
import type {
  CreateProductRecommendationDto,
  UpdateProductRecommendationPayload,
} from '@/server/domains/recommendations/products/types';

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

export async function createRecommendationServerAction(
  payload: CreateProductRecommendationDto,
): Promise<ActionResult<{ id?: number }>> {
  const result = await create_product_recommendation_action(payload);
  return result.success
    ? { success: true, data: result.data }
    : fail(result.error, 'No se pudo crear la recomendación');
}

/** `customer_id` y `product_id` no se pueden cambiar: el PUT los ignora. */
export async function updateRecommendationServerAction(
  payload: UpdateProductRecommendationPayload,
): Promise<ActionResult> {
  const rest: Record<string, unknown> = { ...payload };
  delete rest.customer_id;
  delete rest.product_id;
  const result = await update_product_recommendation_action(rest as UpdateProductRecommendationPayload);
  return result.success ? { success: true } : fail(result.error, 'No se pudo actualizar la recomendación');
}

export async function deleteRecommendationServerAction(id: number): Promise<ActionResult> {
  const result = await delete_product_recommendation_action({ id });
  return result.success ? { success: true } : fail(result.error, 'No se pudo eliminar la recomendación');
}
