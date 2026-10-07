import 'server-only';

import { cache } from 'react';

import { stock_repository } from './repository';
import type { StockLevelsParams, StockReservationsParams } from './types';

/** Existencias por SKU y bodega (on hand, reservado, disponible). */
export const list_stock_levels = cache(async (params: StockLevelsParams) => {
  return stock_repository.list_stock_levels(params);
});

/** Reservas de stock, más recientes primero. */
export const list_stock_reservations = cache(async (params: StockReservationsParams) => {
  return stock_repository.list_stock_reservations(params);
});
