import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type RefundMethodDto = components['schemas']['RefundMethodDto'];
export type CreateRefundMethodDto = components['schemas']['CreateRefundMethodDto'];
export type UpdateRefundMethodDto = components['schemas']['UpdateRefundMethodDto'];

export type UpdateRefundMethodPayload = UpdateRefundMethodDto;

export type DeleteRefundMethodPayload = {
  id: number;
};
