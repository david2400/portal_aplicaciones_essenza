import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type TrackingDto = components['schemas']['TrackingDto'];
export type CreateTrackingDto = components['schemas']['CreateTrackingDto'];
export type UpdateTrackingDto = components['schemas']['UpdateTrackingDto'];

export type DispatchDetailDto = components['schemas']['DispatchDetailDto'];
export type CreateDispatchDetailDto = components['schemas']['CreateDispatchDetailDto'];
export type UpdateDispatchDetailDto = components['schemas']['UpdateDispatchDetailDto'];

export type UpdateTrackingPayload = UpdateTrackingDto & { id: number };
export type UpdateDispatchDetailPayload = UpdateDispatchDetailDto & { id: number };

export type ShippingEstimateDto = components['schemas']['ShippingEstimateDto'];

export type ShippingEstimateQuery = {
  carrier_code: string;
  origin_zip: string;
  destination_zip: string;
  weight?: number;
  service_type?: string;
};
