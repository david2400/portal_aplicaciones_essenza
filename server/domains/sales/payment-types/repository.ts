import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { to_list } from '@/server/lib/list-response';
import { payment_types_tags } from '@/server/lib/cache-tags';
import type {
  PaymentTypeDto,
  CreatePaymentTypePayload,
  UpdatePaymentTypePayload,
  DeletePaymentTypePayload,
} from './types';

const payment_types_base_path = '/api/shop/sales/payment_types';
const payment_type_by_id_path = (id: number) => `${payment_types_base_path}/${id}`;

export const payment_types_repository = {
  async list_payment_types(): Promise<PaymentTypeDto[]> {
    const response = await server_fetch.get<unknown>(payment_types_base_path, {
      revalidate: 30,
      tags: [payment_types_tags.list()],
    });
    return to_list<PaymentTypeDto>(response);
  },

  async get_payment_type_by_id(id: number): Promise<PaymentTypeDto> {
    return server_fetch.get<PaymentTypeDto>(payment_type_by_id_path(id), {
      revalidate: 30,
      tags: [payment_types_tags.item(id)],
    });
  },

  async create_payment_type(payload: CreatePaymentTypePayload): Promise<PaymentTypeDto> {
    return server_fetch.post<PaymentTypeDto>(payment_types_base_path, payload, { revalidate: false });
  },

  async update_payment_type(payload: UpdatePaymentTypePayload): Promise<PaymentTypeDto> {
    return server_fetch.put<PaymentTypeDto>(payment_type_by_id_path(payload.id), payload, { revalidate: false });
  },

  async delete_payment_type(payload: DeletePaymentTypePayload): Promise<void> {
    return server_fetch.delete<void>(payment_type_by_id_path(payload.id), { revalidate: false });
  },
} as const;
