import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { to_list } from '@/server/lib/list-response';
import { attributes_tags } from '@/server/lib/cache-tags';
import type { AttributeDto, SaveAttributeDto, UpdateAttributePayload } from './types';

const attributes_base_path = '/api/shop/catalog/attributes';
const attribute_by_id_path = (id: number) => `${attributes_base_path}/${id}`;

export const attributes_repository = {
  async list_attributes(): Promise<AttributeDto[]> {
    const response = await server_fetch.get<unknown>(attributes_base_path, {
      revalidate: 60,
      tags: [attributes_tags.list()],
    });
    return to_list<AttributeDto>(response);
  },

  async get_attribute_by_id(id: number): Promise<AttributeDto> {
    return server_fetch.get<AttributeDto>(attribute_by_id_path(id), {
      revalidate: 60,
      tags: [attributes_tags.item(id)],
    });
  },

  async create_attribute(payload: SaveAttributeDto): Promise<AttributeDto> {
    return server_fetch.post<AttributeDto>(attributes_base_path, payload, { revalidate: false });
  },

  async update_attribute(payload: UpdateAttributePayload): Promise<AttributeDto> {
    const { id, ...body } = payload;
    return server_fetch.put<AttributeDto>(attribute_by_id_path(id), body, { revalidate: false });
  },

  async delete_attribute(id: number): Promise<void> {
    return server_fetch.delete<void>(attribute_by_id_path(id), { revalidate: false });
  },
} as const;
