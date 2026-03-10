import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type MotiveDevolutionDto = components['schemas']['MotiveDevolutionDto'];
export type CreateMotiveDevolutionDto = components['schemas']['CreateMotiveDevolutionDto'];
export type UpdateMotiveDevolutionDto = components['schemas']['UpdateMotiveDevolutionDto'];

export type UpdateMotiveDevolutionPayload = UpdateMotiveDevolutionDto;

export type DeleteMotiveDevolutionPayload = {
  id: number;
};
