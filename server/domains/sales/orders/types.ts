import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type OrderDto = components['schemas']['OrderDto'];
export type CreateOrderDto = components['schemas']['CreateOrderDto'];
export type UpdateOrderDto = components['schemas']['UpdateOrderDto'];

export type CreateOrderPayload = CreateOrderDto;
export type UpdateOrderPayload = UpdateOrderDto;

export type DeleteOrderPayload = {
  id: number;
};
