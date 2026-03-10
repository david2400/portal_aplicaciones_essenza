import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type ProductFeatureDto = components['schemas']['ProductFeatureDto'];
export type CreateProductFeatureDto = components['schemas']['CreateProductFeatureDto'];
export type UpdateProductFeatureDto = components['schemas']['UpdateProductFeatureDto'];

export type GetProductFeatureParams = {
  product_id: number;
  feature_id: number;
};

export type UpdateProductFeaturePayload = UpdateProductFeatureDto & {
  product_id?: number;
  feature_id?: number;
};

export type DeleteProductFeaturePayload = GetProductFeatureParams;
