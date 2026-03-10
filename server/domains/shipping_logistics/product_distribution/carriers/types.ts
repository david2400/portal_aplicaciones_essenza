import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type CarrierDto = components['schemas']['CarrierDto'];
export type CreateCarrierDto = components['schemas']['CreateCarrierDto'];
export type UpdateCarrierDto = components['schemas']['UpdateCarrierDto'];

export type UpdateCarrierPayload = UpdateCarrierDto & { id: number };
