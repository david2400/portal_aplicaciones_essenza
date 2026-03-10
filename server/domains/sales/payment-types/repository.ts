import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { payment_types_tags } from '@/server/lib/cache-tags';
import type { PaymentTypeDto, CreatePaymentTypeDto } from './types';

const payment_types_base_path = '/api/shop/sales/payment_types';

export const payment_types_repository = {
  async list_payment_types(): Promise<PaymentTypeDto[]> {
    return server_fetch.get<PaymentTypeDto[]>(payment_types_base_path, {
      revalidate: 60,
      tags: [payment_types_tags.list()],
    });
  },

  async create_payment_type(payload: CreatePaymentTypeDto): Promise<PaymentTypeDto> {
    return server_fetch.post<PaymentTypeDto>(payment_types_base_path, payload, {
      revalidate: false,
    });
  },
} as const;
