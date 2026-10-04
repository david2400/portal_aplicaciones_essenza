'use server';

import {
  create_order_action,
  update_order_action,
  delete_order_action,
} from '@/server/domains/sales/orders/actions';
import {
  create_product_order_action,
  update_product_order_action,
  delete_product_order_action,
} from '@/server/domains/sales/product-orders/actions';
import type { CreateOrderDto, UpdateOrderDto } from '@/server/domains/sales/orders/types';
import type {
  CreateProductOrderDto,
  UpdateProductOrderDto,
} from '@/server/domains/sales/product-orders/types';

/**
 * Server actions de órdenes e ítems. Devuelven el resultado en lugar de
 * lanzar para que la UI muestre el motivo real del error.
 */
type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

const fail = (error: string | undefined, fallback: string): ActionResult<never> => ({
  success: false,
  error: error ?? fallback,
});

export async function createOrderServerAction(
  payload: CreateOrderDto,
): Promise<ActionResult<{ id?: number }>> {
  const result = await create_order_action(payload);
  return result.success ? { success: true, data: result.data } : fail(result.error, 'No se pudo crear la orden');
}

export async function updateOrderServerAction(payload: UpdateOrderDto): Promise<ActionResult> {
  const result = await update_order_action(payload);
  return result.success ? { success: true } : fail(result.error, 'No se pudo actualizar la orden');
}

export async function deleteOrderServerAction(id: number): Promise<ActionResult> {
  const result = await delete_order_action({ id });
  return result.success ? { success: true } : fail(result.error, 'No se pudo eliminar la orden');
}

export async function createOrderItemServerAction(
  payload: CreateProductOrderDto,
): Promise<ActionResult<{ id?: number }>> {
  const result = await create_product_order_action(payload);
  return result.success ? { success: true, data: result.data } : fail(result.error, 'No se pudo agregar el ítem');
}

export async function updateOrderItemServerAction(payload: UpdateProductOrderDto): Promise<ActionResult> {
  const result = await update_product_order_action(payload);
  return result.success ? { success: true } : fail(result.error, 'No se pudo actualizar el ítem');
}

export async function deleteOrderItemServerAction(id: number): Promise<ActionResult> {
  const result = await delete_product_order_action({ id });
  return result.success ? { success: true } : fail(result.error, 'No se pudo eliminar el ítem');
}
