import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { stock_tags } from '@/server/lib/cache-tags';
import type { StockItemDto, StockLevelsParams, StockReservationDto, StockReservationsParams } from './types';

const stock_levels_path = '/api/shop/inventory/stock/levels';
const stock_reservations_path = '/api/shop/inventory/stock/reservations';

export const stock_repository = {
  async list_stock_levels(params: StockLevelsParams): Promise<StockItemDto[]> {
    return server_fetch.get<StockItemDto[]>(stock_levels_path, {
      params,
      revalidate: 15,
      tags: [stock_tags.all()],
    });
  },

  async list_stock_reservations(params: StockReservationsParams): Promise<StockReservationDto[]> {
    return server_fetch.get<StockReservationDto[]>(stock_reservations_path, {
      params,
      revalidate: 15,
      tags: [stock_tags.all()],
    });
  },
} as const;
