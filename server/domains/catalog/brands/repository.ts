import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { brands_tags } from '@/server/lib/cache-tags';
import type { BrandDto, CreateBrandPayload, UpdateBrandPayload, DeleteBrandPayload } from './types';

const brands_base_path = '/api/shop/catalog/brands';
const brand_by_id_path = (id: number) => `${brands_base_path}/${id}`;

export const brands_repository = {
  async create_brand(payload: CreateBrandPayload): Promise<BrandDto> {
    return server_fetch.post<BrandDto>(brands_base_path, payload, {
      revalidate: false,
    });
  },

  async get_brand_by_id(id: number): Promise<BrandDto> {
    return server_fetch.get<BrandDto>(brand_by_id_path(id), {
      revalidate: 60,
      tags: [brands_tags.item(id)],
    });
  },

  async update_brand(payload: UpdateBrandPayload): Promise<BrandDto> {
    const { id, ...body } = payload;
    return server_fetch.put<BrandDto>(brand_by_id_path(id), body, {
      revalidate: false,
    });
  },

  async delete_brand(payload: DeleteBrandPayload): Promise<void> {
    return server_fetch.delete<void>(brand_by_id_path(payload.id), {
      revalidate: false,
    });
  },
} as const;
