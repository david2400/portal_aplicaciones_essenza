import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { to_list } from '@/server/lib/list-response';
import { product_templates_tags } from '@/server/lib/cache-tags';
import type { ProductTemplateDto, SaveProductTemplateDto, UpdateProductTemplatePayload } from './types';

const product_templates_base_path = '/api/shop/catalog/product_templates';
const product_template_by_id_path = (id: number) => `${product_templates_base_path}/${id}`;

export const product_templates_repository = {
  async list_product_templates(): Promise<ProductTemplateDto[]> {
    const response = await server_fetch.get<unknown>(product_templates_base_path, {
      revalidate: 60,
      tags: [product_templates_tags.list()],
    });
    return to_list<ProductTemplateDto>(response);
  },

  async get_product_template_by_id(id: number): Promise<ProductTemplateDto> {
    return server_fetch.get<ProductTemplateDto>(product_template_by_id_path(id), {
      revalidate: 60,
      tags: [product_templates_tags.item(id)],
    });
  },

  async create_product_template(payload: SaveProductTemplateDto): Promise<ProductTemplateDto> {
    return server_fetch.post<ProductTemplateDto>(product_templates_base_path, payload, { revalidate: false });
  },

  async update_product_template(payload: UpdateProductTemplatePayload): Promise<ProductTemplateDto> {
    const { id, ...body } = payload;
    return server_fetch.put<ProductTemplateDto>(product_template_by_id_path(id), body, { revalidate: false });
  },

  async delete_product_template(id: number): Promise<void> {
    return server_fetch.delete<void>(product_template_by_id_path(id), { revalidate: false });
  },
} as const;
