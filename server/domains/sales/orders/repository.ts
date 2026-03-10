import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { orders_tags } from '@/server/lib/cache-tags';
import type { OrderDto, CreateOrderDto } from './types';

const orders_base_path = '/api/shop/sales/orders';

export const orders_repository = {
  async list_orders(): Promise<OrderDto[]> {
    return server_fetch.get<OrderDto[]>(orders_base_path, {
      revalidate: 60,
      tags: [orders_tags.list()],
    });
  },

  async create_order(payload: CreateOrderDto): Promise<OrderDto> {
    return server_fetch.post<OrderDto>(orders_base_path, payload, {
      revalidate: false,
    });
  },
} as const;
