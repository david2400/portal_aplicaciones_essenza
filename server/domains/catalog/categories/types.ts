import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type CategoryDto = components['schemas']['CategoryDto'];
export type CreateCategoryDto = components['schemas']['CreateCategoryDto'];
export type UpdateCategoryDto = components['schemas']['UpdateCategoryDto'];

export type CreateCategoryPayload = CreateCategoryDto;
export type UpdateCategoryPayload = UpdateCategoryDto;

export type DeleteCategoryPayload = {
  id: number;
};
