import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type PaymentTypeDto = components['schemas']['PaymentTypeDto'];
export type CreatePaymentTypeDto = components['schemas']['CreatePaymentTypeDto'];
export type UpdatePaymentTypeDto = components['schemas']['UpdatePaymentTypeDto'];

export type CreatePaymentTypePayload = CreatePaymentTypeDto;
export type UpdatePaymentTypePayload = UpdatePaymentTypeDto;

export type DeletePaymentTypePayload = {
  id: number;
};
