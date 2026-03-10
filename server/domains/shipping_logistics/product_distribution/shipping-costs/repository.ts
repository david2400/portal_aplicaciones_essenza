import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { shipping_costs_tags } from '@/server/lib/cache-tags';
import type {
  ShippingCostDto,
  CreateShippingCostDto,
  UpdateShippingCostPayload,
  CalculateShippingCostParams,
} from './types';

const shipping_costs_base_path = '/api/shop/product_distribution/shipping_costs';
const shipping_costs_calculate_path = `${shipping_costs_base_path}/calculate`;
const shipping_cost_by_id_path = (id: number) => `${shipping_costs_base_path}/${id}`;

export function build_shipping_calculation_hash(params: CalculateShippingCostParams): string {
  return JSON.stringify({
    carrier_id: params.carrier_id,
    origin_address: params.origin_address,
    destination_address: params.destination_address,
    weight: params.weight ?? null,
    volume: params.volume ?? null,
  });
}

function build_calculation_query(params: CalculateShippingCostParams): {
  query: string;
  hash: string;
} {
  const search = new URLSearchParams();
  search.set('carrierId', String(params.carrier_id));
  search.set('originAddress', params.origin_address);
  search.set('destinationAddress', params.destination_address);

  if (params.weight !== undefined) {
    search.set('weight', String(params.weight));
  }
  if (params.volume !== undefined) {
    search.set('volume', String(params.volume));
  }

  const query_string = search.toString();
  const hash = build_shipping_calculation_hash(params);
  return { query: query_string ? `?${query_string}` : '', hash };
}

export const shipping_costs_repository = {
  async list_shipping_costs(): Promise<ShippingCostDto[]> {
    return server_fetch.get<ShippingCostDto[]>(shipping_costs_base_path, {
      revalidate: 60,
      tags: [shipping_costs_tags.list()],
    });
  },

  async get_shipping_cost_by_id(id: number): Promise<ShippingCostDto> {
    return server_fetch.get<ShippingCostDto>(shipping_cost_by_id_path(id), {
      revalidate: 60,
      tags: [shipping_costs_tags.item(id)],
    });
  },

  async create_shipping_cost(payload: CreateShippingCostDto): Promise<ShippingCostDto> {
    return server_fetch.post<ShippingCostDto>(shipping_costs_base_path, payload, {
      revalidate: false,
    });
  },

  async update_shipping_cost(payload: UpdateShippingCostPayload): Promise<ShippingCostDto> {
    return server_fetch.put<ShippingCostDto>(shipping_cost_by_id_path(payload.id), payload, {
      revalidate: false,
    });
  },

  async delete_shipping_cost(id: number): Promise<void> {
    return server_fetch.delete<void>(shipping_cost_by_id_path(id), {
      revalidate: false,
    });
  },

  async calculate_shipping_cost(params: CalculateShippingCostParams): Promise<ShippingCostDto> {
    const { query, hash } = build_calculation_query(params);
    return server_fetch.post<ShippingCostDto>(`${shipping_costs_calculate_path}${query}`, undefined, {
      revalidate: false,
      tags: [shipping_costs_tags.calculation(hash)],
    });
  },
} as const;
