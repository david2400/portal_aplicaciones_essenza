import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type ProductChildDto = components['schemas']['ProductChildDto'];
export type CreateProductChildDto = components['schemas']['CreateProductChildDto'];
export type UpdateProductChildDto = components['schemas']['UpdateProductChildDto'];

export type UpdateProductChildPayload = UpdateProductChildDto;

export type DeleteProductChildPayload = {
  id: number;
};
