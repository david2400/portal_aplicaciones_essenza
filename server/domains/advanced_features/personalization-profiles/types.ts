import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

/** Generados desde el Swagger del backend (snake_case). */
export type CreatePersonalizationProfileDto = components['schemas']['CreatePersonalizationProfileDto'];
export type UpdatePersonalizationProfileDto = components['schemas']['UpdatePersonalizationProfileDto'];
export type PersonalizationProfileDto = components['schemas']['PersonalizationProfileDto'];

export type CreatePersonalizationProfilePayload = CreatePersonalizationProfileDto;
export type UpdatePersonalizationProfilePayload = UpdatePersonalizationProfileDto & { id: number };

export type DeletePersonalizationProfilePayload = {
  id: number;
};
