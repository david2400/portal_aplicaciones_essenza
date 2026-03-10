import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { categories_tags } from '@/server/lib/cache-tags';
import type { CategoryDto, CreateCategoryPayload, UpdateCategoryPayload, DeleteCategoryPayload } from './types';

const categories_base_path = '/api/shop/catalog/categories';
const category_by_id_path = (id: number) => `${categories_base_path}/${id}`;

export const categories_repository = {
  async create_category(payload: CreateCategoryPayload): Promise<CategoryDto> {
    return server_fetch.post<CategoryDto>(categories_base_path, payload, {
      revalidate: false,
    });
  },

  async get_category_by_id(id: number): Promise<CategoryDto> {
    return server_fetch.get<CategoryDto>(category_by_id_path(id), {
      revalidate: 60,
      tags: [categories_tags.item(id)],
    });
  },

  async update_category(payload: UpdateCategoryPayload): Promise<CategoryDto> {
    const { id, ...body } = payload;
    return server_fetch.put<CategoryDto>(category_by_id_path(id), body, {
      revalidate: false,
    });
  },

  async delete_category(payload: DeleteCategoryPayload): Promise<void> {
    return server_fetch.delete<void>(category_by_id_path(payload.id), {
      revalidate: false,
    });
  },
} as const;
