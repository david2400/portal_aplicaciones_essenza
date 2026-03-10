import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type ProductComboDto = components['schemas']['ProductComboDto'];
export type CreateProductComboDto = components['schemas']['CreateProductComboDto'];
export type UpdateProductComboDto = components['schemas']['UpdateProductComboDto'];

export type UpdateProductComboPayload = UpdateProductComboDto;

export type DeleteProductComboPayload = {
  id: number;
};
