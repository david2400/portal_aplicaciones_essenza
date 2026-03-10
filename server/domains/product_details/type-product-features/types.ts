import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type TypeProductFeatureDto = components['schemas']['TypeProductFeatureDto'];
export type CreateTypeProductFeatureDto = components['schemas']['CreateTypeProductFeatureDto'];
export type UpdateTypeProductFeatureDto = components['schemas']['UpdateTypeProductFeatureDto'];

export type UpdateTypeProductFeaturePayload = UpdateTypeProductFeatureDto & {
  type_product_id: number;
};

export type DeleteTypeProductFeaturePayload = {
  type_product_id: number;
};
