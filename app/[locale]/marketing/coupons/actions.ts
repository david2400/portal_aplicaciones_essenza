'use server';

import {
  create_coupon_action,
  update_coupon_action,
  delete_coupon_action,
  validate_coupon_action,
  calculate_coupon_discount_action,
} from '@/server/domains/promotions/coupons/actions';
import type { CreateCouponDto, UpdateCouponDto } from '@/server/domains/promotions/coupons/types';

type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string };

const fail = (error: string | undefined, fallback: string): ActionResult<never> => ({
  success: false,
  error: error ?? fallback,
});

export async function createCouponServerAction(payload: CreateCouponDto): Promise<ActionResult> {
  const result = await create_coupon_action(payload);
  return result.success ? { success: true } : fail(result.error, 'No se pudo crear el cupón');
}

export async function updateCouponServerAction(payload: UpdateCouponDto): Promise<ActionResult> {
  const result = await update_coupon_action({ ...payload, id: payload.id });
  return result.success ? { success: true } : fail(result.error, 'No se pudo actualizar el cupón');
}

export async function deleteCouponServerAction(id: number): Promise<ActionResult> {
  const result = await delete_coupon_action(id);
  return result.success ? { success: true } : fail(result.error, 'No se pudo eliminar el cupón');
}

/**
 * Simula la aplicación de un cupón: valida reglas (vigencia, mínimo, usos,
 * categorías y productos) y calcula el descuento para un monto dado.
 */
export async function simulateCouponServerAction(params: {
  code: string;
  orderAmount: number;
  productIds?: number[];
  categoryIds?: number[];
}): Promise<ActionResult<{ discount: number }>> {
  const query = {
    code: params.code,
    order_amount: params.orderAmount,
    product_ids: params.productIds,
    category_ids: params.categoryIds,
  };
  const validation = await validate_coupon_action(query);
  if (!validation.success) return fail(validation.error, 'El cupón no es válido');

  const calculation = await calculate_coupon_discount_action(query);
  return calculation.success
    ? { success: true, data: { discount: calculation.data.discount } }
    : fail(calculation.error, 'No se pudo calcular el descuento');
}
