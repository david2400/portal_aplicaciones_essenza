import 'server-only';

import { cache } from 'react';

import { orders_repository } from './repository';
import type { OrderFilterParams } from './types';

export const list_orders = cache(async () => {
  return orders_repository.list_orders();
});

export const get_order_by_id = cache(async ({ id }: { id: number }) => {
  return orders_repository.get_order_by_id(id);
});

export const get_order_reservations = cache(async ({ id }: { id: number }) => {
  return orders_repository.list_order_reservations(id);
});

/** KPIs con los mismos filtros del listado. */
export const get_order_summary = cache(async (params: OrderFilterParams) => orders_repository.summary(params));

export const get_order_timeline = cache(async (id: number) => orders_repository.timeline(id));

export const get_order_numbering = cache(async () => orders_repository.numbering());
