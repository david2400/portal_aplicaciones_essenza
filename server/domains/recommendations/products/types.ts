import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

/** Generados desde el Swagger del backend (snake_case). */
export type CreateProductRecommendationDto = components['schemas']['CreateProductRecommendationDto'];
export type UpdateProductRecommendationDto = components['schemas']['UpdateProductRecommendationDto'];
export type ProductRecommendationDto = components['schemas']['ProductRecommendationDto'];

export type CreateProductRecommendationPayload = CreateProductRecommendationDto;
export type UpdateProductRecommendationPayload = UpdateProductRecommendationDto & { id: number };

export type DeleteProductRecommendationPayload = {
  id: number;
};
