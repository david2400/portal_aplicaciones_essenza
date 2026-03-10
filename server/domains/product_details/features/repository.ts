import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { features_tags } from '@/server/lib/cache-tags';
import type {
  FeatureDto,
  CreateFeatureDto,
  UpdateFeaturePayload,
  DeleteFeaturePayload,
} from './types';

const features_base_path = '/api/shop/product_details/features';
const feature_by_id_path = (id: number) => `${features_base_path}/${id}`;

export const features_repository = {
  async list_features(): Promise<FeatureDto[]> {
    return server_fetch.get<FeatureDto[]>(features_base_path, {
      revalidate: 60,
      tags: [features_tags.list()],
    });
  },

  async get_feature_by_id(id: number): Promise<FeatureDto> {
    return server_fetch.get<FeatureDto>(feature_by_id_path(id), {
      revalidate: 60,
      tags: [features_tags.item(id)],
    });
  },

  async create_feature(payload: CreateFeatureDto): Promise<FeatureDto> {
    return server_fetch.post<FeatureDto>(features_base_path, payload, {
      revalidate: false,
    });
  },

  async update_feature(payload: UpdateFeaturePayload): Promise<FeatureDto> {
    const { id, ...body } = payload;
    return server_fetch.put<FeatureDto>(feature_by_id_path(id), body, {
      revalidate: false,
    });
  },

  async delete_feature(payload: DeleteFeaturePayload): Promise<void> {
    return server_fetch.delete<void>(feature_by_id_path(payload.id), {
      revalidate: false,
    });
  },
} as const;
