import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type PaymentMethodDto = components['schemas']['PaymentMethodDto'];
export type SavePaymentMethodDto = components['schemas']['SavePaymentMethodDto'];
export type GatewayProviderDto = components['schemas']['GatewayProviderDto'];

export type UpdatePaymentMethodPayload = SavePaymentMethodDto & { id: number };
