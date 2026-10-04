'use server';

import {
  create_product_feature_action,
  update_product_feature_action,
  delete_product_feature_action,
} from '@/server/domains/product_details/product-features/actions';

type ActionResult = { success: true } | { success: false; error: string };

type ProductFeatureInput = { productId: number; featureId: number; value: number };

const done = (result: { success: boolean; error?: string }, fallback: string): ActionResult =>
  result.success ? { success: true } : { success: false, error: result.error ?? fallback };

/** La clave es compuesta: producto + característica (`/{productId}/{featureId}`). */
export async function createProductFeatureServerAction(payload: ProductFeatureInput): Promise<ActionResult> {
  return done(await create_product_feature_action(payload), 'No se pudo guardar el valor');
}

export async function updateProductFeatureServerAction(payload: ProductFeatureInput): Promise<ActionResult> {
  return done(
    await update_product_feature_action({
      ...payload,
      // `id` es obligatorio en el DTO pero el backend usa la clave compuesta de la URL.
      id: payload.productId,
      product_id: payload.productId,
      feature_id: payload.featureId,
    }),
    'No se pudo actualizar el valor',
  );
}

export async function deleteProductFeatureServerAction(productId: number, featureId: number): Promise<ActionResult> {
  return done(
    await delete_product_feature_action({ product_id: productId, feature_id: featureId }),
    'No se pudo eliminar el valor',
  );
}
