import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { to_list } from '@/server/lib/list-response';
import { personalization_profiles_tags } from '@/server/lib/cache-tags';
import type {
  PersonalizationProfileDto,
  CreatePersonalizationProfilePayload,
  UpdatePersonalizationProfilePayload,
  DeletePersonalizationProfilePayload,
} from './types';

const personalization_profiles_base_path = '/api/shop/advanced-features/personalization-profiles';
const personalization_profile_by_id_path = (id: number) => `${personalization_profiles_base_path}/${id}`;

export const personalization_profiles_repository = {
  async list_personalization_profiles(): Promise<PersonalizationProfileDto[]> {
    const response = await server_fetch.get<unknown>(personalization_profiles_base_path, {
      revalidate: 30,
      tags: [personalization_profiles_tags.list()],
    });
    return to_list<PersonalizationProfileDto>(response);
  },

  async get_personalization_profile_by_id(id: number): Promise<PersonalizationProfileDto> {
    return server_fetch.get<PersonalizationProfileDto>(personalization_profile_by_id_path(id), {
      revalidate: 30,
      tags: [personalization_profiles_tags.item(id)],
    });
  },

  async create_personalization_profile(payload: CreatePersonalizationProfilePayload): Promise<PersonalizationProfileDto> {
    return server_fetch.post<PersonalizationProfileDto>(personalization_profiles_base_path, payload, { revalidate: false });
  },

  async update_personalization_profile(payload: UpdatePersonalizationProfilePayload): Promise<PersonalizationProfileDto> {
    const { id, ...body } = payload;
    return server_fetch.put<PersonalizationProfileDto>(personalization_profile_by_id_path(id), body, { revalidate: false });
  },

  async delete_personalization_profile(payload: DeletePersonalizationProfilePayload): Promise<void> {
    return server_fetch.delete<void>(personalization_profile_by_id_path(payload.id), { revalidate: false });
  },
} as const;
