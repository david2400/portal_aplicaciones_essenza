import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type ProductDto = components['schemas']['ProductDto'];
export type CreateProductDto = components['schemas']['CreateProductDto'];
export type UpdateProductDto = components['schemas']['UpdateProductDto'];
export type ProductFilter = components['schemas']['ProductFilter'];
export type ProductSkuDto = components['schemas']['ProductSkuDto'];
export type ProductImageDto = components['schemas']['ProductImageDto'];
export type ProductStatsDto = components['schemas']['ProductStatsDto'];
export type ProductStatsParams = { low_stock_threshold?: number; low_stock_limit?: number };
export type ReplaceProductImagesDto = components['schemas']['ReplaceProductImagesDto'];
export type ReplaceProductImagesPayload = ReplaceProductImagesDto & { id: number };

export type ListProductsParams = {
  page?: number;
  size?: number;
  sort?: string;
};

export type ProductSearchParams = ListProductsParams & {
  filter: ProductFilter;
};

export type UpdateProductPayload = UpdateProductDto & { id: number };

export type DeleteProductPayload = {
  id: number;
};
