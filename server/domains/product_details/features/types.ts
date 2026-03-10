import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type FeatureDto = components['schemas']['FeatureDto'];
export type CreateFeatureDto = components['schemas']['CreateFeatureDto'];
export type UpdateFeatureDto = components['schemas']['UpdateFeatureDto'];

export type UpdateFeaturePayload = UpdateFeatureDto & { id: number };

export type DeleteFeaturePayload = { id: number };
