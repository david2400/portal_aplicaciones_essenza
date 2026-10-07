import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { product_children_tags } from '@/server/lib/cache-tags';
import type {
  ProductChildDto,
  CreateProductChildDto,
  UpdateProductChildPayload,
  DeleteProductChildPayload,
} from './types';

const product_children_base_path = '/api/shop/catalog/variants';
const product_child_by_id_path = (id: number) => `${product_children_base_path}/${id}`;

export const product_children_repository = {
  async list_product_children(): Promise<ProductChildDto[]> {
    return server_fetch.get<ProductChildDto[]>(product_children_base_path, {
      revalidate: 60,
      tags: [product_children_tags.list()],
    });
  },

  async list_variants_of_product(product_id: number): Promise<ProductChildDto[]> {
    return server_fetch.get<ProductChildDto[]>(product_children_base_path, {
      params: { product_id },
      revalidate: 30,
      tags: [product_children_tags.list()],
    });
  },

  async get_product_child_by_id(id: number): Promise<ProductChildDto> {
    return server_fetch.get<ProductChildDto>(product_child_by_id_path(id), {
      revalidate: 60,
      tags: [product_children_tags.item(id)],
    });
  },

  async create_product_child(payload: CreateProductChildDto): Promise<ProductChildDto> {
    return server_fetch.post<ProductChildDto>(product_children_base_path, payload, {
      revalidate: false,
    });
  },

  async update_product_child(payload: UpdateProductChildPayload): Promise<ProductChildDto> {
    const { id, ...body } = payload;
    return server_fetch.put<ProductChildDto>(product_child_by_id_path(id), body, {
      revalidate: false,
    });
  },

  async delete_product_child(payload: DeleteProductChildPayload): Promise<void> {
    return server_fetch.delete<void>(product_child_by_id_path(payload.id), {
      revalidate: false,
    });
  },
} as const;
