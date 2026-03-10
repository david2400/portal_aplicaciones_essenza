import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { dispatch_products_tags } from '@/server/lib/cache-tags';
import type {
  DispatchProductDto,
  CreateDispatchProductDto,
  UpdateDispatchProductPayload,
  DeleteDispatchProductPayload,
  DispatchProductShippingEstimateDto,
  DispatchProductShippingEstimateQuery,
} from './types';

const dispatch_products_base_path = '/api/shop/dispatch/dispatch_products';
const dispatch_product_by_id_path = (id: number) => `${dispatch_products_base_path}/${id}`;
const dispatch_product_shipping_estimate_path = `${dispatch_products_base_path}/shipping-estimate`;

function map_shipping_estimate_params(
  query: DispatchProductShippingEstimateQuery,
): Record<string, string | number> {
  const params: Record<string, string | number> = {
    carrierCode: query.carrier_code,
    originZip: query.origin_zip,
    destinationZip: query.destination_zip,
  };

  if (query.weight !== undefined) {
    params.weight = query.weight;
  }
  if (query.service_type) {
    params.serviceType = query.service_type;
  }

  return params;
}

export const dispatch_products_repository = {
  async list_dispatch_products(): Promise<DispatchProductDto[]> {
    return server_fetch.get<DispatchProductDto[]>(dispatch_products_base_path, {
      revalidate: 60,
      tags: [dispatch_products_tags.list()],
    });
  },

  async get_dispatch_product_by_id(id: number): Promise<DispatchProductDto> {
    return server_fetch.get<DispatchProductDto>(dispatch_product_by_id_path(id), {
      revalidate: 60,
      tags: [dispatch_products_tags.item(id)],
    });
  },

  async create_dispatch_product(payload: CreateDispatchProductDto): Promise<DispatchProductDto> {
    return server_fetch.post<DispatchProductDto>(dispatch_products_base_path, payload, {
      revalidate: false,
    });
  },

  async update_dispatch_product(payload: UpdateDispatchProductPayload): Promise<DispatchProductDto> {
    const { id, ...body } = payload;
    return server_fetch.put<DispatchProductDto>(dispatch_product_by_id_path(id), body, {
      revalidate: false,
    });
  },

  async delete_dispatch_product(payload: DeleteDispatchProductPayload): Promise<void> {
    return server_fetch.delete<void>(dispatch_product_by_id_path(payload.id), {
      revalidate: false,
    });
  },

  async fetch_dispatch_product_shipping_estimate(
    query: DispatchProductShippingEstimateQuery,
  ): Promise<DispatchProductShippingEstimateDto> {
    return server_fetch.get<DispatchProductShippingEstimateDto>(
      dispatch_product_shipping_estimate_path,
      {
        params: map_shipping_estimate_params(query),
        revalidate: 30,
      },
    );
  },
} as const;
