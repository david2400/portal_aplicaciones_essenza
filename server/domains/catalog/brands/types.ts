import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type BrandDto = components['schemas']['BrandDto'];
export type CreateBrandDto = components['schemas']['CreateBrandDto'];
export type UpdateBrandDto = components['schemas']['UpdateBrandDto'];

export type CreateBrandPayload = CreateBrandDto;
export type UpdateBrandPayload = UpdateBrandDto;

export type DeleteBrandPayload = {
  id: number;
};
