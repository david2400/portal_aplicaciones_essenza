import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { to_list } from '@/server/lib/list-response';
import { product_recommendations_tags } from '@/server/lib/cache-tags';
import type {
  ProductRecommendationDto,
  CreateProductRecommendationPayload,
  UpdateProductRecommendationPayload,
  DeleteProductRecommendationPayload,
} from './types';

const product_recommendations_base_path = '/api/shop/recommendations/products';
const product_recommendation_by_id_path = (id: number) => `${product_recommendations_base_path}/${id}`;

export const product_recommendations_repository = {
  async list_product_recommendations(): Promise<ProductRecommendationDto[]> {
    const response = await server_fetch.get<unknown>(product_recommendations_base_path, {
      revalidate: 30,
      tags: [product_recommendations_tags.list()],
    });
    return to_list<ProductRecommendationDto>(response);
  },

  async get_product_recommendation_by_id(id: number): Promise<ProductRecommendationDto> {
    return server_fetch.get<ProductRecommendationDto>(product_recommendation_by_id_path(id), {
      revalidate: 30,
      tags: [product_recommendations_tags.item(id)],
    });
  },

  async create_product_recommendation(payload: CreateProductRecommendationPayload): Promise<ProductRecommendationDto> {
    return server_fetch.post<ProductRecommendationDto>(product_recommendations_base_path, payload, { revalidate: false });
  },

  async update_product_recommendation(payload: UpdateProductRecommendationPayload): Promise<ProductRecommendationDto> {
    const { id, ...body } = payload;
    return server_fetch.put<ProductRecommendationDto>(product_recommendation_by_id_path(id), body, { revalidate: false });
  },

  async delete_product_recommendation(payload: DeleteProductRecommendationPayload): Promise<void> {
    return server_fetch.delete<void>(product_recommendation_by_id_path(payload.id), { revalidate: false });
  },
} as const;
