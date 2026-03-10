import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { delivery_estimates_tags } from '@/server/lib/cache-tags';
import type {
  DeliveryEstimateDto,
  CreateDeliveryEstimateDto,
  UpdateDeliveryEstimatePayload,
  CalculateDeliveryEstimateParams,
} from './types';

const delivery_estimates_base_path = '/api/shop/product_distribution/delivery_estimates';
const delivery_estimates_calculate_path = `${delivery_estimates_base_path}/calculate`;
const delivery_estimate_by_id_path = (id: number) => `${delivery_estimates_base_path}/${id}`;

export function build_delivery_estimate_hash(params: CalculateDeliveryEstimateParams): string {
  return JSON.stringify({
    carrier_id: params.carrier_id,
    origin_address: params.origin_address,
    destination_address: params.destination_address,
    shipment_date: params.shipment_date,
    is_business_days_only: params.is_business_days_only ?? null,
  });
}

function build_calculation_query(params: CalculateDeliveryEstimateParams): {
  query: string;
  hash: string;
} {
  const search = new URLSearchParams();
  search.set('carrierId', String(params.carrier_id));
  search.set('originAddress', params.origin_address);
  search.set('destinationAddress', params.destination_address);
  search.set('shipmentDate', params.shipment_date);
  if (params.is_business_days_only !== undefined) {
    search.set('isBusinessDaysOnly', String(params.is_business_days_only));
  }

  const query_string = search.toString();
  const hash = build_delivery_estimate_hash(params);
  return { query: query_string ? `?${query_string}` : '', hash };
}

export const delivery_estimates_repository = {
  async list_delivery_estimates(): Promise<DeliveryEstimateDto[]> {
    return server_fetch.get<DeliveryEstimateDto[]>(delivery_estimates_base_path, {
      revalidate: 60,
      tags: [delivery_estimates_tags.list()],
    });
  },

  async get_delivery_estimate_by_id(id: number): Promise<DeliveryEstimateDto> {
    return server_fetch.get<DeliveryEstimateDto>(delivery_estimate_by_id_path(id), {
      revalidate: 60,
      tags: [delivery_estimates_tags.item(id)],
    });
  },

  async create_delivery_estimate(payload: CreateDeliveryEstimateDto): Promise<DeliveryEstimateDto> {
    return server_fetch.post<DeliveryEstimateDto>(delivery_estimates_base_path, payload, {
      revalidate: false,
    });
  },

  async update_delivery_estimate(
    payload: UpdateDeliveryEstimatePayload,
  ): Promise<DeliveryEstimateDto> {
    return server_fetch.put<DeliveryEstimateDto>(delivery_estimate_by_id_path(payload.id), payload, {
      revalidate: false,
    });
  },

  async delete_delivery_estimate(id: number): Promise<void> {
    return server_fetch.delete<void>(delivery_estimate_by_id_path(id), {
      revalidate: false,
    });
  },

  async calculate_delivery_estimate(
    params: CalculateDeliveryEstimateParams,
  ): Promise<DeliveryEstimateDto> {
    const { query, hash } = build_calculation_query(params);
    return server_fetch.post<DeliveryEstimateDto>(
      `${delivery_estimates_calculate_path}${query}`,
      undefined,
      {
        revalidate: false,
        tags: [delivery_estimates_tags.calculation(hash)],
      },
    );
  },
} as const;
