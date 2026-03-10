import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type ProductDto = components['schemas']['ProductDto'];
export type CreateProductDto = components['schemas']['CreateProductDto'];
export type UpdateProductDto = components['schemas']['UpdateProductDto'];
export type ProductFilter = components['schemas']['ProductFilter'];

export type ListProductsParams = {
  page?: number;
  size?: number;
  sort?: string;
};

export type ProductSearchParams = ListProductsParams & {
  filter: ProductFilter;
};

export type UpdateProductPayload = UpdateProductDto;

export type DeleteProductPayload = {
  id: number;
};
