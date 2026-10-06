import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

/** Generados desde el Swagger del backend (snake_case). */
export type CreatePageDto = components['schemas']['CreatePageDto'];
export type UpdatePageDto = components['schemas']['UpdatePageDto'];
export type PageDto = components['schemas']['PageDto'];

export type CreatePagePayload = CreatePageDto;
export type UpdatePagePayload = UpdatePageDto & { id: number };

export type DeletePagePayload = {
  id: number;
};
