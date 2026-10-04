import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type TypeProductDto = components['schemas']['TypeProductDto'];
export type CreateTypeProductDto = components['schemas']['CreateTypeProductDto'];
export type UpdateTypeProductDto = components['schemas']['UpdateTypeProductDto'];

export type CreateTypeProductPayload = CreateTypeProductDto;
export type UpdateTypeProductPayload = UpdateTypeProductDto;

export type DeleteTypeProductPayload = {
  id: number;
};
