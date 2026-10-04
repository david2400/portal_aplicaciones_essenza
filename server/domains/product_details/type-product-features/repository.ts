import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { to_list } from '@/server/lib/list-response';
import { type_product_features_tags } from '@/server/lib/cache-tags';
import type {
  TypeProductFeatureDto,
  CreateTypeProductFeatureDto,
  UpdateTypeProductFeaturePayload,
  DeleteTypeProductFeaturePayload,
  UpdateTypeProductFeatureDto,
} from './types';

const type_product_features_base_path = '/api/shop/product_details/type_product_features';
const type_product_feature_by_type_product_path = (type_product_id: number) =>
  `${type_product_features_base_path}/${type_product_id}`;

export const type_product_features_repository = {
  async list_type_product_features(): Promise<TypeProductFeatureDto[]> {
    const response = await server_fetch.get<unknown>(type_product_features_base_path, {
      revalidate: 60,
      tags: [type_product_features_tags.list()],
    });
    return to_list<TypeProductFeatureDto>(response);
  },

  async get_type_product_feature_by_type_product(
    type_product_id: number,
  ): Promise<TypeProductFeatureDto> {
    return server_fetch.get<TypeProductFeatureDto>(
      type_product_feature_by_type_product_path(type_product_id),
      {
        revalidate: 60,
        tags: [type_product_features_tags.item(type_product_id)],
      },
    );
  },

  async create_type_product_feature(
    payload: CreateTypeProductFeatureDto,
  ): Promise<TypeProductFeatureDto> {
    return server_fetch.post<TypeProductFeatureDto>(type_product_features_base_path, payload, {
      revalidate: false,
    });
  },

  async update_type_product_feature(
    payload: UpdateTypeProductFeaturePayload,
  ): Promise<TypeProductFeatureDto> {
    const { type_product_id, ...body } = payload;
    return server_fetch.put<TypeProductFeatureDto>(
      type_product_feature_by_type_product_path(type_product_id),
      body as UpdateTypeProductFeatureDto,
      {
        revalidate: false,
      },
    );
  },

  async delete_type_product_feature(
    payload: DeleteTypeProductFeaturePayload,
  ): Promise<void> {
    return server_fetch.delete<void>(
      type_product_feature_by_type_product_path(payload.type_product_id),
      {
        revalidate: false,
      },
    );
  },
} as const;
