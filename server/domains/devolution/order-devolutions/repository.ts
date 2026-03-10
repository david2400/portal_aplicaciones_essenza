import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { order_devolutions_tags } from '@/server/lib/cache-tags';
import type {
  OrderDevolutionDto,
  CreateOrderDevolutionDto,
  UpdateOrderDevolutionPayload,
  DeleteOrderDevolutionPayload,
} from './types';

const order_devolutions_base_path = '/api/shop/devolution/order_devolutions';
const order_devolution_by_id_path = (id: number) => `${order_devolutions_base_path}/${id}`;

export const order_devolutions_repository = {
  async list_order_devolutions(): Promise<OrderDevolutionDto[]> {
    return server_fetch.get<OrderDevolutionDto[]>(order_devolutions_base_path, {
      revalidate: 60,
      tags: [order_devolutions_tags.list()],
    });
  },

  async get_order_devolution_by_id(id: number): Promise<OrderDevolutionDto> {
    return server_fetch.get<OrderDevolutionDto>(order_devolution_by_id_path(id), {
      revalidate: 60,
      tags: [order_devolutions_tags.item(id)],
    });
  },

  async create_order_devolution(payload: CreateOrderDevolutionDto): Promise<OrderDevolutionDto> {
    return server_fetch.post<OrderDevolutionDto>(order_devolutions_base_path, payload, {
      revalidate: false,
    });
  },

  async update_order_devolution(payload: UpdateOrderDevolutionPayload): Promise<OrderDevolutionDto> {
    const { id, ...body } = payload;
    return server_fetch.put<OrderDevolutionDto>(order_devolution_by_id_path(id), body, {
      revalidate: false,
    });
  },

  async delete_order_devolution(payload: DeleteOrderDevolutionPayload): Promise<void> {
    return server_fetch.delete<void>(order_devolution_by_id_path(payload.id), {
      revalidate: false,
    });
  },
} as const;
