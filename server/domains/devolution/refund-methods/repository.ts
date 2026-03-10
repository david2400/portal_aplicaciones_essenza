import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { refund_methods_tags } from '@/server/lib/cache-tags';
import type {
  RefundMethodDto,
  CreateRefundMethodDto,
  UpdateRefundMethodPayload,
  DeleteRefundMethodPayload,
} from './types';

const refund_methods_base_path = '/api/shop/devolution/refund_methods';
const refund_method_by_id_path = (id: number) => `${refund_methods_base_path}/${id}`;

export const refund_methods_repository = {
  async list_refund_methods(): Promise<RefundMethodDto[]> {
    return server_fetch.get<RefundMethodDto[]>(refund_methods_base_path, {
      revalidate: 60,
      tags: [refund_methods_tags.list()],
    });
  },

  async get_refund_method_by_id(id: number): Promise<RefundMethodDto> {
    return server_fetch.get<RefundMethodDto>(refund_method_by_id_path(id), {
      revalidate: 60,
      tags: [refund_methods_tags.item(id)],
    });
  },

  async create_refund_method(payload: CreateRefundMethodDto): Promise<RefundMethodDto> {
    return server_fetch.post<RefundMethodDto>(refund_methods_base_path, payload, {
      revalidate: false,
    });
  },

  async update_refund_method(payload: UpdateRefundMethodPayload): Promise<RefundMethodDto> {
    const { id, ...body } = payload;
    return server_fetch.put<RefundMethodDto>(refund_method_by_id_path(id), body, {
      revalidate: false,
    });
  },

  async delete_refund_method(payload: DeleteRefundMethodPayload): Promise<void> {
    return server_fetch.delete<void>(refund_method_by_id_path(payload.id), {
      revalidate: false,
    });
  },
} as const;
