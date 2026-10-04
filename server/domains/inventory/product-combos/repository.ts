import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { to_list } from '@/server/lib/list-response';
import { product_combos_tags } from '@/server/lib/cache-tags';
import type {
  ProductComboDto,
  CreateProductComboDto,
  UpdateProductComboPayload,
  DeleteProductComboPayload,
} from './types';

const product_combos_base_path = '/api/shop/inventory/product_combos';
const product_combo_by_id_path = (id: number) => `${product_combos_base_path}/${id}`;

export const product_combos_repository = {
  async list_product_combos(): Promise<ProductComboDto[]> {
    const response = await server_fetch.get<unknown>(product_combos_base_path, {
      revalidate: 60,
      tags: [product_combos_tags.list()],
    });
    return to_list<ProductComboDto>(response);
  },

  async get_product_combo_by_id(id: number): Promise<ProductComboDto> {
    return server_fetch.get<ProductComboDto>(product_combo_by_id_path(id), {
      revalidate: 60,
      tags: [product_combos_tags.item(id)],
    });
  },

  async create_product_combo(payload: CreateProductComboDto): Promise<ProductComboDto> {
    return server_fetch.post<ProductComboDto>(product_combos_base_path, payload, {
      revalidate: false,
    });
  },

  async update_product_combo(payload: UpdateProductComboPayload): Promise<ProductComboDto> {
    const { id, ...body } = payload;
    return server_fetch.put<ProductComboDto>(product_combo_by_id_path(id), body, {
      revalidate: false,
    });
  },

  async delete_product_combo(payload: DeleteProductComboPayload): Promise<void> {
    return server_fetch.delete<void>(product_combo_by_id_path(payload.id), {
      revalidate: false,
    });
  },
} as const;
