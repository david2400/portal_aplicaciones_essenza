import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { return_methods_tags } from '@/server/lib/cache-tags';
import type {
  ReturnMethodDto,
  CreateReturnMethodDto,
  UpdateReturnMethodPayload,
  DeleteReturnMethodPayload,
} from './types';

const return_methods_base_path = '/api/shop/devolution/return_methods';
const return_method_by_id_path = (id: number) => `${return_methods_base_path}/${id}`;

export const return_methods_repository = {
  async list_return_methods(): Promise<ReturnMethodDto[]> {
    return server_fetch.get<ReturnMethodDto[]>(return_methods_base_path, {
      revalidate: 60,
      tags: [return_methods_tags.list()],
    });
  },

  async get_return_method_by_id(id: number): Promise<ReturnMethodDto> {
    return server_fetch.get<ReturnMethodDto>(return_method_by_id_path(id), {
      revalidate: 60,
      tags: [return_methods_tags.item(id)],
    });
  },

  async create_return_method(payload: CreateReturnMethodDto): Promise<ReturnMethodDto> {
    return server_fetch.post<ReturnMethodDto>(return_methods_base_path, payload, {
      revalidate: false,
    });
  },

  async update_return_method(payload: UpdateReturnMethodPayload): Promise<ReturnMethodDto> {
    const { id, ...body } = payload;
    return server_fetch.put<ReturnMethodDto>(return_method_by_id_path(id), body, {
      revalidate: false,
    });
  },

  async delete_return_method(payload: DeleteReturnMethodPayload): Promise<void> {
    return server_fetch.delete<void>(return_method_by_id_path(payload.id), {
      revalidate: false,
    });
  },
} as const;
