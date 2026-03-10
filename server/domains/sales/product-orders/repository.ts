import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { product_orders_tags } from '@/server/lib/cache-tags';
import type { ProductOrderDto, CreateProductOrderDto } from './types';

const product_orders_base_path = '/api/shop/sales/product_orders';

export const product_orders_repository = {
  async list_product_orders(): Promise<ProductOrderDto[]> {
    return server_fetch.get<ProductOrderDto[]>(product_orders_base_path, {
      revalidate: 60,
      tags: [product_orders_tags.list()],
    });
  },

  async create_product_order(payload: CreateProductOrderDto): Promise<ProductOrderDto> {
    return server_fetch.post<ProductOrderDto>(product_orders_base_path, payload, {
      revalidate: false,
    });
  },
} as const;
