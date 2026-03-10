import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { motive_devolutions_tags } from '@/server/lib/cache-tags';
import type {
  MotiveDevolutionDto,
  CreateMotiveDevolutionDto,
  UpdateMotiveDevolutionPayload,
  DeleteMotiveDevolutionPayload,
} from './types';

const motive_devolutions_base_path = '/api/shop/devolution/motive_devolutions';
const motive_devolution_by_id_path = (id: number) => `${motive_devolutions_base_path}/${id}`;

export const motive_devolutions_repository = {
  async list_motive_devolutions(): Promise<MotiveDevolutionDto[]> {
    return server_fetch.get<MotiveDevolutionDto[]>(motive_devolutions_base_path, {
      revalidate: 60,
      tags: [motive_devolutions_tags.list()],
    });
  },

  async get_motive_devolution_by_id(id: number): Promise<MotiveDevolutionDto> {
    return server_fetch.get<MotiveDevolutionDto>(motive_devolution_by_id_path(id), {
      revalidate: 60,
      tags: [motive_devolutions_tags.item(id)],
    });
  },

  async create_motive_devolution(payload: CreateMotiveDevolutionDto): Promise<MotiveDevolutionDto> {
    return server_fetch.post<MotiveDevolutionDto>(motive_devolutions_base_path, payload, {
      revalidate: false,
    });
  },

  async update_motive_devolution(payload: UpdateMotiveDevolutionPayload): Promise<MotiveDevolutionDto> {
    const { id, ...body } = payload;
    return server_fetch.put<MotiveDevolutionDto>(motive_devolution_by_id_path(id), body, {
      revalidate: false,
    });
  },

  async delete_motive_devolution(payload: DeleteMotiveDevolutionPayload): Promise<void> {
    return server_fetch.delete<void>(motive_devolution_by_id_path(payload.id), {
      revalidate: false,
    });
  },
} as const;
