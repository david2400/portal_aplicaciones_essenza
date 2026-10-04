'use server';

import {
  create_type_product_feature_action,
  update_type_product_feature_action,
  delete_type_product_feature_action,
} from '@/server/domains/product_details/type-product-features/actions';

type ActionResult = { success: true } | { success: false; error: string };

const done = (result: { success: boolean; error?: string }, fallback: string): ActionResult =>
  result.success ? { success: true } : { success: false, error: result.error ?? fallback };

/** El backend identifica la asignación por el tipo de producto (`/{typeProductId}`). */
export async function createTypeProductFeatureServerAction(payload: {
  typeProductId: number;
  featureId: number;
}): Promise<ActionResult> {
  return done(await create_type_product_feature_action(payload), 'No se pudo asignar la característica');
}

export async function updateTypeProductFeatureServerAction(payload: {
  typeProductId: number;
  featureId: number;
}): Promise<ActionResult> {
  return done(
    await update_type_product_feature_action({
      type_product_id: payload.typeProductId,
      featureId: payload.featureId,
    }),
    'No se pudo actualizar la asignación',
  );
}

export async function deleteTypeProductFeatureServerAction(typeProductId: number): Promise<ActionResult> {
  return done(
    await delete_type_product_feature_action({ type_product_id: typeProductId }),
    'No se pudo eliminar la asignación',
  );
}
