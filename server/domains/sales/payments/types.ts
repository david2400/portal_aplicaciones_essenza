import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type PaymentDto = components['schemas']['PaymentDto'];
export type PaymentEventDto = components['schemas']['PaymentEventDto'];
export type OrderPaymentsDto = components['schemas']['OrderPaymentsDto'];
export type PaymentsSummaryDto = components['schemas']['PaymentsSummaryDto'];
export type RegisterPaymentDto = components['schemas']['RegisterPaymentDto'];
export type StartCheckoutDto = components['schemas']['StartCheckoutDto'];
export type CheckoutDto = components['schemas']['CheckoutDto'];
export type PaymentActionDto = components['schemas']['PaymentActionDto'];

export type PaymentAction = 'confirm' | 'decline' | 'void' | 'refund' | 'sync';
