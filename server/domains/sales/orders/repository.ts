import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { to_list } from '@/server/lib/list-response';
import { orders_tags } from '@/server/lib/cache-tags';
import type {
  OrderDto,
  CreateOrderPayload,
  UpdateOrderPayload,
  DeleteOrderPayload,
} from './types';

const orders_base_path = '/api/shop/sales/orders';
const order_by_id_path = (id: number) => `${orders_base_path}/${id}`;

export const orders_repository = {
  async list_orders(): Promise<OrderDto[]> {
    const response = await server_fetch.get<unknown>(orders_base_path, {
      revalidate: 30,
      tags: [orders_tags.list()],
    });
    return to_list<OrderDto>(response);
  },

  async get_order_by_id(id: number): Promise<OrderDto> {
    return server_fetch.get<OrderDto>(order_by_id_path(id), {
      revalidate: 30,
      tags: [orders_tags.item(id)],
    });
  },

  async create_order(payload: CreateOrderPayload): Promise<OrderDto> {
    return server_fetch.post<OrderDto>(orders_base_path, payload, { revalidate: false });
  },

  async update_order(payload: UpdateOrderPayload): Promise<OrderDto> {
    return server_fetch.put<OrderDto>(order_by_id_path(payload.id), payload, { revalidate: false });
  },

  async delete_order(payload: DeleteOrderPayload): Promise<void> {
    return server_fetch.delete<void>(order_by_id_path(payload.id), { revalidate: false });
  },
} as const;
