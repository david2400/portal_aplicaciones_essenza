import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { carriers_tags } from '@/server/lib/cache-tags';
import type { CarrierDto, CreateCarrierDto, UpdateCarrierPayload } from './types';

const carriers_base_path = '/api/shop/product_distribution/carriers';
const carrier_by_id_path = (id: number) => `${carriers_base_path}/${id}`;

export const carriers_repository = {
  async list_carriers(): Promise<CarrierDto[]> {
    return server_fetch.get<CarrierDto[]>(carriers_base_path, {
      revalidate: 60,
      tags: [carriers_tags.list()],
    });
  },

  async get_carrier_by_id(id: number): Promise<CarrierDto> {
    return server_fetch.get<CarrierDto>(carrier_by_id_path(id), {
      revalidate: 60,
      tags: [carriers_tags.item(id)],
    });
  },

  async create_carrier(payload: CreateCarrierDto): Promise<CarrierDto> {
    return server_fetch.post<CarrierDto>(carriers_base_path, payload, {
      revalidate: false,
    });
  },

  async update_carrier(payload: UpdateCarrierPayload): Promise<CarrierDto> {
    return server_fetch.put<CarrierDto>(carrier_by_id_path(payload.id), payload, {
      revalidate: false,
    });
  },

  async delete_carrier(id: number): Promise<void> {
    return server_fetch.delete<void>(carrier_by_id_path(id), {
      revalidate: false,
    });
  },
} as const;
