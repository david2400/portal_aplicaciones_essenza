import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { to_list } from '@/server/lib/list-response';
import { pages_tags } from '@/server/lib/cache-tags';
import type {
  PageDto,
  CreatePagePayload,
  UpdatePagePayload,
  DeletePagePayload,
} from './types';

const pages_base_path = '/api/shop/cms/pages';
const page_by_id_path = (id: number) => `${pages_base_path}/${id}`;

export const pages_repository = {
  async list_pages(): Promise<PageDto[]> {
    const response = await server_fetch.get<unknown>(pages_base_path, {
      revalidate: 30,
      tags: [pages_tags.list()],
    });
    return to_list<PageDto>(response);
  },

  async get_page_by_id(id: number): Promise<PageDto> {
    return server_fetch.get<PageDto>(page_by_id_path(id), {
      revalidate: 30,
      tags: [pages_tags.item(id)],
    });
  },

  async create_page(payload: CreatePagePayload): Promise<PageDto> {
    return server_fetch.post<PageDto>(pages_base_path, payload, { revalidate: false });
  },

  async update_page(payload: UpdatePagePayload): Promise<PageDto> {
    const { id, ...body } = payload;
    return server_fetch.put<PageDto>(page_by_id_path(id), body, { revalidate: false });
  },

  async delete_page(payload: DeletePagePayload): Promise<void> {
    return server_fetch.delete<void>(page_by_id_path(payload.id), { revalidate: false });
  },
} as const;
