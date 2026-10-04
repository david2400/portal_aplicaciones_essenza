import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { to_list } from '@/server/lib/list-response';
import { subcategories_tags } from '@/server/lib/cache-tags';
import type {
  SubcategoryDto,
  CreateSubcategoryPayload,
  UpdateSubcategoryPayload,
  DeleteSubcategoryPayload,
} from './types';

const subcategories_base_path = '/api/shop/catalog/subcategories';
const subcategory_by_id_path = (id: number) => `${subcategories_base_path}/${id}`;

export const subcategories_repository = {
  async list_subcategories(): Promise<SubcategoryDto[]> {
    const response = await server_fetch.get<unknown>(subcategories_base_path, {
      revalidate: 60,
      tags: [subcategories_tags.list()],
    });
    return to_list<SubcategoryDto>(response);
  },

  async create_subcategory(payload: CreateSubcategoryPayload): Promise<SubcategoryDto> {
    return server_fetch.post<SubcategoryDto>(subcategories_base_path, payload, {
      revalidate: false,
    });
  },

  async get_subcategory_by_id(id: number): Promise<SubcategoryDto> {
    return server_fetch.get<SubcategoryDto>(subcategory_by_id_path(id), {
      revalidate: 60,
      tags: [subcategories_tags.item(id)],
    });
  },

  async update_subcategory(payload: UpdateSubcategoryPayload): Promise<SubcategoryDto> {
    const { id, ...body } = payload;
    return server_fetch.put<SubcategoryDto>(subcategory_by_id_path(id), body, {
      revalidate: false,
    });
  },

  async delete_subcategory(payload: DeleteSubcategoryPayload): Promise<void> {
    return server_fetch.delete<void>(subcategory_by_id_path(payload.id), {
      revalidate: false,
    });
  },
} as const;
