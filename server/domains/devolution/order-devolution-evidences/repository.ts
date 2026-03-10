import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { order_devolution_evidences_tags } from '@/server/lib/cache-tags';
import type {
  OrderDevolutionEvidenceDto,
  CreateOrderDevolutionEvidenceDto,
  UpdateOrderDevolutionEvidencePayload,
  DeleteOrderDevolutionEvidencePayload,
} from './types';

const order_devolution_evidences_base_path = '/api/shop/devolution/order_devolution_evidences';
const order_devolution_evidence_by_id_path = (id: number) =>
  `${order_devolution_evidences_base_path}/${id}`;

export const order_devolution_evidences_repository = {
  async list_order_devolution_evidences(): Promise<OrderDevolutionEvidenceDto[]> {
    return server_fetch.get<OrderDevolutionEvidenceDto[]>(order_devolution_evidences_base_path, {
      revalidate: 60,
      tags: [order_devolution_evidences_tags.list()],
    });
  },

  async get_order_devolution_evidence_by_id(id: number): Promise<OrderDevolutionEvidenceDto> {
    return server_fetch.get<OrderDevolutionEvidenceDto>(order_devolution_evidence_by_id_path(id), {
      revalidate: 60,
      tags: [order_devolution_evidences_tags.item(id)],
    });
  },

  async create_order_devolution_evidence(
    payload: CreateOrderDevolutionEvidenceDto,
  ): Promise<OrderDevolutionEvidenceDto> {
    return server_fetch.post<OrderDevolutionEvidenceDto>(order_devolution_evidences_base_path, payload, {
      revalidate: false,
    });
  },

  async update_order_devolution_evidence(
    payload: UpdateOrderDevolutionEvidencePayload,
  ): Promise<OrderDevolutionEvidenceDto> {
    const { id, ...body } = payload;
    return server_fetch.put<OrderDevolutionEvidenceDto>(order_devolution_evidence_by_id_path(id), body, {
      revalidate: false,
    });
  },

  async delete_order_devolution_evidence(
    payload: DeleteOrderDevolutionEvidencePayload,
  ): Promise<void> {
    return server_fetch.delete<void>(order_devolution_evidence_by_id_path(payload.id), {
      revalidate: false,
    });
  },
} as const;
