import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { to_list } from '@/server/lib/list-response';
import { type_products_tags } from '@/server/lib/cache-tags';
import type {
  TypeProductDto,
  CreateTypeProductPayload,
  UpdateTypeProductPayload,
  DeleteTypeProductPayload,
} from './types';

const type_products_base_path = '/api/shop/product_details/type_products';
const type_product_by_id_path = (id: number) => `${type_products_base_path}/${id}`;

export const type_products_repository = {
  async list_type_products(): Promise<TypeProductDto[]> {
    const response = await server_fetch.get<unknown>(type_products_base_path, {
      revalidate: 30,
      tags: [type_products_tags.list()],
    });
    return to_list<TypeProductDto>(response);
  },

  async get_type_product_by_id(id: number): Promise<TypeProductDto> {
    return server_fetch.get<TypeProductDto>(type_product_by_id_path(id), {
      revalidate: 30,
      tags: [type_products_tags.item(id)],
    });
  },

  async create_type_product(payload: CreateTypeProductPayload): Promise<TypeProductDto> {
    return server_fetch.post<TypeProductDto>(type_products_base_path, payload, { revalidate: false });
  },

  async update_type_product(payload: UpdateTypeProductPayload): Promise<TypeProductDto> {
    return server_fetch.put<TypeProductDto>(type_product_by_id_path(payload.id), payload, { revalidate: false });
  },

  async delete_type_product(payload: DeleteTypeProductPayload): Promise<void> {
    return server_fetch.delete<void>(type_product_by_id_path(payload.id), { revalidate: false });
  },
} as const;
