import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type SubcategoryDto = components['schemas']['SubcategoryDto'];
export type CreateSubcategoryDto = components['schemas']['CreateSubcategoryDto'];
export type UpdateSubcategoryDto = components['schemas']['UpdateSubcategoryDto'];

export type CreateSubcategoryPayload = CreateSubcategoryDto;
export type UpdateSubcategoryPayload = UpdateSubcategoryDto;

export type DeleteSubcategoryPayload = {
  id: number;
};
