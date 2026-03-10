import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type DispatchProductDto = components['schemas']['DispatchProductDto'];
export type CreateDispatchProductDto = components['schemas']['CreateDispatchProductDto'];
export type UpdateDispatchProductDto = components['schemas']['UpdateDispatchProductDto'];
export type DispatchProductShippingEstimateDto = components['schemas']['ShippingEstimateDto'];
export type DispatchProductShippingEstimateQuery = {
  carrier_code: string;
  origin_zip: string;
  destination_zip: string;
  weight?: number;
  service_type?: string;
};

export type UpdateDispatchProductPayload = UpdateDispatchProductDto;

export type DeleteDispatchProductPayload = {
  id: number;
};
