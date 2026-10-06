import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { product_attributes_tags } from '@/server/lib/cache-tags';
import type { ProductAttributesDto, SaveProductAttributesDto } from './types';

const product_attributes_path = (product_id: number) => `/api/shop/catalog/products/${product_id}/attributes`;

export const product_attributes_repository = {
  async get_product_attributes(product_id: number): Promise<ProductAttributesDto> {
    return server_fetch.get<ProductAttributesDto>(product_attributes_path(product_id), {
      revalidate: false,
      tags: [product_attributes_tags.all(), product_attributes_tags.item(product_id)],
    });
  },

  async save_product_attributes(product_id: number, payload: SaveProductAttributesDto): Promise<ProductAttributesDto> {
    return server_fetch.put<ProductAttributesDto>(product_attributes_path(product_id), payload, { revalidate: false });
  },
} as const;
