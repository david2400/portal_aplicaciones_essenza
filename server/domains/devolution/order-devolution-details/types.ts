import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type OrderDevolutionDetailDto = components['schemas']['OrderDevolutionDetailDto'];
export type CreateOrderDevolutionDetailDto = components['schemas']['CreateOrderDevolutionDetailDto'];
export type UpdateOrderDevolutionDetailDto = components['schemas']['UpdateOrderDevolutionDetailDto'];

export type UpdateOrderDevolutionDetailPayload = UpdateOrderDevolutionDetailDto;

export type DeleteOrderDevolutionDetailPayload = {
  id: number;
};
