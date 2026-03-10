import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type OrderDevolutionEvidenceDto = components['schemas']['EvidenceDto'];
export type CreateOrderDevolutionEvidenceDto = components['schemas']['CreateEvidenceDto'];
export type UpdateOrderDevolutionEvidenceDto = components['schemas']['UpdateEvidenceDto'];

export type UpdateOrderDevolutionEvidencePayload = UpdateOrderDevolutionEvidenceDto;

export type DeleteOrderDevolutionEvidencePayload = {
  id: number;
};
