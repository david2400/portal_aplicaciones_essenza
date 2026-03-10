import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type DeliveryEstimateDto = components['schemas']['DeliveryEstimateDto'];
export type CreateDeliveryEstimateDto = components['schemas']['CreateDeliveryEstimateDto'];
export type UpdateDeliveryEstimateDto = components['schemas']['UpdateDeliveryEstimateDto'];

export type UpdateDeliveryEstimatePayload = UpdateDeliveryEstimateDto & { id: number };

export type CalculateDeliveryEstimateParams = {
  carrier_id: number;
  origin_address: string;
  destination_address: string;
  shipment_date: string;
  is_business_days_only?: boolean;
};
