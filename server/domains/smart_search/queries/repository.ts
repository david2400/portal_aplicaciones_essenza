import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { to_list } from '@/server/lib/list-response';
import { search_queries_tags } from '@/server/lib/cache-tags';
import type {
  SearchQueryDto,
  CreateSearchQueryPayload,
  UpdateSearchQueryPayload,
  DeleteSearchQueryPayload,
} from './types';

const search_queries_base_path = '/api/shop/smart-search/queries';
const search_query_by_id_path = (id: number) => `${search_queries_base_path}/${id}`;

export const search_queries_repository = {
  async list_search_queries(): Promise<SearchQueryDto[]> {
    const response = await server_fetch.get<unknown>(search_queries_base_path, {
      revalidate: 30,
      tags: [search_queries_tags.list()],
    });
    return to_list<SearchQueryDto>(response);
  },

  async get_search_query_by_id(id: number): Promise<SearchQueryDto> {
    return server_fetch.get<SearchQueryDto>(search_query_by_id_path(id), {
      revalidate: 30,
      tags: [search_queries_tags.item(id)],
    });
  },

  async create_search_query(payload: CreateSearchQueryPayload): Promise<SearchQueryDto> {
    return server_fetch.post<SearchQueryDto>(search_queries_base_path, payload, { revalidate: false });
  },

  async update_search_query(payload: UpdateSearchQueryPayload): Promise<SearchQueryDto> {
    const { id, ...body } = payload;
    return server_fetch.put<SearchQueryDto>(search_query_by_id_path(id), body, { revalidate: false });
  },

  async delete_search_query(payload: DeleteSearchQueryPayload): Promise<void> {
    return server_fetch.delete<void>(search_query_by_id_path(payload.id), { revalidate: false });
  },
} as const;
