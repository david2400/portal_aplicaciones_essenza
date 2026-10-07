import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type StockItemDto = components['schemas']['StockItemDto'];
export type StockReservationDto = components['schemas']['StockReservationDto'];
export type StockReservationStatus = NonNullable<StockReservationDto['status']>;

export type StockLevelsParams = { sku_id?: number; product_id?: number; warehouse_id?: number };

export type StockReservationsParams = {
  order_id?: number;
  sku_id?: number;
  product_id?: number;
  status?: StockReservationStatus;
  limit?: number;
};
