'use server';

import { parse_grid_query } from '@/server/lib/pagination';
import type { BulkResult } from '@/shared/models/pagination';
import type { OrderDto } from '@/server/domains/sales/orders/types';
import { ORDER_GRID } from './grid';
import {
  create_order_action,
  update_order_action,
  delete_order_action,
  bulk_delete_orders_action,
  export_orders_action,
  change_order_status_action,
} from '@/server/domains/sales/orders/actions';
import {
  create_product_order_action,
  update_product_order_action,
  delete_product_order_action,
} from '@/server/domains/sales/product-orders/actions';
import type { ChangeOrderStatusDto, CreateOrderDto, UpdateOrderDto } from '@/server/domains/sales/orders/types';
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

/** Cambia el estado de la orden (pagar descuenta stock; cancelar lo libera o devuelve). */
export async function changeOrderStatusServerAction(
  id: number,
  state: ChangeOrderStatusDto['state'],
  reason?: string,
): Promise<ActionResult> {
  const result = await change_order_status_action(id, { state, reason });
  return result.success ? { success: true } : fail(result.error, 'No se pudo cambiar el estado de la orden');
}

export async function deleteOrderItemServerAction(id: number, orderId?: number): Promise<ActionResult> {
  const result = await delete_product_order_action({ id, order_id: orderId });
  return result.success ? { success: true } : fail(result.error, 'No se pudo eliminar el ítem');
}

export async function bulkDeleteOrdersServerAction(ids: number[]): Promise<ActionResult<BulkResult>> {
  const result = await bulk_delete_orders_action(ids);
  return result.success ? { success: true, data: result.data } : fail(result.error, 'No se pudieron eliminar las órdenes');
}

/** Exporta todas las órdenes que cumplen la búsqueda actual. */
export async function exportOrdersServerAction(
  params: Record<string, string>,
): Promise<ActionResult<{ items: OrderDto[]; truncated: boolean }>> {
  const result = await export_orders_action(parse_grid_query(params, ORDER_GRID));
  return result.success ? { success: true, data: result.data } : fail(result.error, 'No se pudo exportar');
}
