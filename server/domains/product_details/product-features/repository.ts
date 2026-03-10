import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { product_features_tags } from '@/server/lib/cache-tags';
import type {
  ProductFeatureDto,
  CreateProductFeatureDto,
  UpdateProductFeaturePayload,
  DeleteProductFeaturePayload,
  GetProductFeatureParams,
  UpdateProductFeatureDto,
} from './types';

const product_features_base_path = '/api/shop/product_details/product_features';
const product_feature_path = (product_id: number, feature_id: number) =>
  `${product_features_base_path}/${product_id}/${feature_id}`;

function resolve_ids({
  product_id,
  feature_id,
  productId,
  featureId,
}: Partial<UpdateProductFeaturePayload> & Partial<GetProductFeatureParams>) {
  const resolved_product_id = product_id ?? productId;
  const resolved_feature_id = feature_id ?? featureId;

  if (typeof resolved_product_id !== 'number' || typeof resolved_feature_id !== 'number') {
    throw new Error('product_feature_ids_required');
  }

  return { product_id: resolved_product_id, feature_id: resolved_feature_id };
}

export const product_features_repository = {
  async list_product_features(): Promise<ProductFeatureDto[]> {
    return server_fetch.get<ProductFeatureDto[]>(product_features_base_path, {
      revalidate: 60,
      tags: [product_features_tags.list()],
    });
  },

  async get_product_feature(params: GetProductFeatureParams): Promise<ProductFeatureDto> {
    return server_fetch.get<ProductFeatureDto>(
      product_feature_path(params.product_id, params.feature_id),
      {
        revalidate: 60,
        tags: [product_features_tags.item(params.product_id, params.feature_id)],
      },
    );
  },

  async create_product_feature(payload: CreateProductFeatureDto): Promise<ProductFeatureDto> {
    return server_fetch.post<ProductFeatureDto>(product_features_base_path, payload, {
      revalidate: false,
    });
  },

  async update_product_feature(payload: UpdateProductFeaturePayload): Promise<ProductFeatureDto> {
    const { product_id, feature_id } = resolve_ids(payload);
    const { product_id: _p, feature_id: _f, ...body } = payload;

    return server_fetch.put<ProductFeatureDto>(
      product_feature_path(product_id, feature_id),
      body as UpdateProductFeatureDto,
      {
        revalidate: false,
      },
    );
  },

  async delete_product_feature(payload: DeleteProductFeaturePayload): Promise<void> {
    return server_fetch.delete<void>(product_feature_path(payload.product_id, payload.feature_id), {
      revalidate: false,
    });
  },
} as const;
