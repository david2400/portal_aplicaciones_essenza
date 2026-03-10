import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type ReturnMethodDto = components['schemas']['ReturnMethodDto'];
export type CreateReturnMethodDto = components['schemas']['CreateReturnMethodDto'];
export type UpdateReturnMethodDto = components['schemas']['UpdateReturnMethodDto'];

export type UpdateReturnMethodPayload = UpdateReturnMethodDto;

export type DeleteReturnMethodPayload = {
  id: number;
};
