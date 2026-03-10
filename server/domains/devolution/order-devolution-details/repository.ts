import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { order_devolution_details_tags } from '@/server/lib/cache-tags';
import type {
  OrderDevolutionDetailDto,
  CreateOrderDevolutionDetailDto,
  UpdateOrderDevolutionDetailPayload,
  DeleteOrderDevolutionDetailPayload,
} from './types';

const order_devolution_details_base_path = '/api/shop/devolution/order_devolution_details';
const order_devolution_detail_by_id_path = (id: number) =>
  `${order_devolution_details_base_path}/${id}`;

export const order_devolution_details_repository = {
  async list_order_devolution_details(): Promise<OrderDevolutionDetailDto[]> {
    return server_fetch.get<OrderDevolutionDetailDto[]>(order_devolution_details_base_path, {
      revalidate: 60,
      tags: [order_devolution_details_tags.list()],
    });
  },

  async get_order_devolution_detail_by_id(id: number): Promise<OrderDevolutionDetailDto> {
    return server_fetch.get<OrderDevolutionDetailDto>(order_devolution_detail_by_id_path(id), {
      revalidate: 60,
      tags: [order_devolution_details_tags.item(id)],
    });
  },

  async create_order_devolution_detail(
    payload: CreateOrderDevolutionDetailDto,
  ): Promise<OrderDevolutionDetailDto> {
    return server_fetch.post<OrderDevolutionDetailDto>(order_devolution_details_base_path, payload, {
      revalidate: false,
    });
  },

  async update_order_devolution_detail(
    payload: UpdateOrderDevolutionDetailPayload,
  ): Promise<OrderDevolutionDetailDto> {
    const { id, ...body } = payload;
    return server_fetch.put<OrderDevolutionDetailDto>(order_devolution_detail_by_id_path(id), body, {
      revalidate: false,
    });
  },

  async delete_order_devolution_detail(
    payload: DeleteOrderDevolutionDetailPayload,
  ): Promise<void> {
    return server_fetch.delete<void>(order_devolution_detail_by_id_path(payload.id), {
      revalidate: false,
    });
  },
} as const;
