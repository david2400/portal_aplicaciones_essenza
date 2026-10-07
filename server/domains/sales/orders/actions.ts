'use server';

import { revalidateTag } from 'next/cache';

import { orders_repository } from './repository';
import { orders_resource } from './search';
import type { OrderDto } from './types';
import type { BulkResult, GridQuery } from '@/shared/models/pagination';
import type { CreateOrderPayload, UpdateOrderPayload, DeleteOrderPayload, ChangeOrderStatusDto } from './types';
import { inventory_movements_tags, orders_tags, product_orders_tags, products_tags, stock_tags } from '@/server/lib/cache-tags';
import { ServerApiError } from '@/server/lib/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; status?: number };

function handle_error(error: unknown): ActionResult<never> {
  if (error instanceof ServerApiError) {
    return { success: false, error: error.message, status: error.status };
  }
  const message = error instanceof Error ? error.message : 'Unexpected error';
  return { success: false, error: message };
}

function revalidate_orders(id?: number) {
  revalidateTag(orders_tags.list());
  if (id != null) {
    revalidateTag(orders_tags.item(id));
  }
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function create_order_action(
  payload: CreateOrderPayload,
): Promise<ActionResult<{ id?: number }>> {
  try {
    const result = await orders_repository.create_order(payload);
    revalidate_orders(result.id);
    return { success: true, data: { id: result.id } };
  } catch (error) {
    return handle_error(error);
  }
}

export async function update_order_action(payload: UpdateOrderPayload): Promise<ActionResult> {
  try {
    await orders_repository.update_order(payload);
    revalidate_orders(payload.id);
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}

export async function delete_order_action(payload: DeleteOrderPayload): Promise<ActionResult> {
  try {
    await orders_repository.delete_order(payload);
    revalidate_orders(payload.id);
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}

/** Cambia el estado. Pagar o cancelar mueve stock: se refrescan kardex y productos. */
export async function change_order_status_action(id: number, payload: ChangeOrderStatusDto): Promise<ActionResult> {
  try {
    await orders_repository.change_order_status(id, payload);
    revalidate_orders(id);
    revalidateTag(product_orders_tags.list());
    revalidateTag(inventory_movements_tags.list());
    revalidateTag(products_tags.list());
    revalidateTag(stock_tags.all());
    return { success: true, data: undefined };
  } catch (error) {
    return handle_error(error);
  }
}

// ─── Lote y exportación ──────────────────────────────────────────────────────

export async function bulk_delete_orders_action(ids: number[]): Promise<ActionResult<BulkResult>> {
  try {
    const result = await orders_resource.bulk_delete(ids);
    revalidateTag(orders_tags.list());
    for (const id of ids) revalidateTag(orders_tags.item(id));
    return { success: true, data: result };
  } catch (error) {
    return handle_error(error);
  }
}

export async function export_orders_action(
  query: GridQuery,
): Promise<ActionResult<{ items: OrderDto[]; truncated: boolean }>> {
  try {
    return { success: true, data: await orders_resource.export_all(query) };
  } catch (error) {
    return handle_error(error);
  }
}
