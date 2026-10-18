import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { to_list } from '@/server/lib/list-response';
import { billing_tags } from '@/server/lib/cache-tags';
import type { ResolutionDto, SaveResolutionDto } from './types';

const base_path = '/api/shop/billing/resolutions';

export const resolutions_repository = {
  async list_resolutions(kind?: string): Promise<ResolutionDto[]> {
    const response = await server_fetch.get<unknown>(kind ? `${base_path}?kind=${kind}` : base_path, {
      revalidate: 0,
      tags: [billing_tags.resolutions()],
    });
    return to_list<ResolutionDto>(response);
  },
  async create_resolution(payload: SaveResolutionDto): Promise<ResolutionDto> {
    return server_fetch.post<ResolutionDto>(base_path, payload, { revalidate: false });
  },
  async update_resolution(id: number, payload: SaveResolutionDto): Promise<ResolutionDto> {
    return server_fetch.put<ResolutionDto>(`${base_path}/${id}`, payload, { revalidate: false });
  },
  async delete_resolution(id: number): Promise<void> {
    return server_fetch.delete<void>(`${base_path}/${id}`, { revalidate: false });
  },
} as const;
