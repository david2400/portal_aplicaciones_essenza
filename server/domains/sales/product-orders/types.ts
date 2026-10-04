import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type ProductOrderDto = components['schemas']['ProductOrderDto'];
export type CreateProductOrderDto = components['schemas']['CreateProductOrderDto'];
export type UpdateProductOrderDto = components['schemas']['UpdateProductOrderDto'];

export type CreateProductOrderPayload = CreateProductOrderDto;
export type UpdateProductOrderPayload = UpdateProductOrderDto;

export type DeleteProductOrderPayload = {
  id: number;
};
