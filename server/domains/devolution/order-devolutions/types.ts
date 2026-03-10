import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type OrderDevolutionDto = components['schemas']['OrderDevolutionDto'];
export type CreateOrderDevolutionDto = components['schemas']['CreateOrderDevolutionDto'];
export type UpdateOrderDevolutionDto = components['schemas']['UpdateOrderDevolutionDto'];

export type UpdateOrderDevolutionPayload = UpdateOrderDevolutionDto;

export type DeleteOrderDevolutionPayload = {
  id: number;
};
