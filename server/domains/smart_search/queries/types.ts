import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

/** Generados desde el Swagger del backend (snake_case). */
export type CreateSearchQueryDto = components['schemas']['CreateSearchQueryDto'];
export type UpdateSearchQueryDto = components['schemas']['UpdateSearchQueryDto'];
export type SearchQueryDto = components['schemas']['SearchQueryDto'];

export type CreateSearchQueryPayload = CreateSearchQueryDto;
export type UpdateSearchQueryPayload = UpdateSearchQueryDto & { id: number };

export type DeleteSearchQueryPayload = {
  id: number;
};
