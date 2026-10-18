import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type WarehouseDto = components['schemas']['WarehouseDto'];
export type SaveWarehouseDto = components['schemas']['SaveWarehouseDto'];
export type WarehouseStatsDto = components['schemas']['WarehouseStatsDto'];
export type WarehouseStockDto = components['schemas']['WarehouseStockDto'];
export type WarehouseMovementDto = components['schemas']['WarehouseMovementDto'];
export type WarehouseLinksDto = components['schemas']['WarehouseLinksDto'];
export type WarehouseLocationDto = components['schemas']['WarehouseLocationDto'];
export type SaveLocationDto = components['schemas']['SaveLocationDto'];
export type PageWarehouseDto = components['schemas']['PageResponseWarehouseDto'];

export type ListWarehousesParams = { page?: number; size?: number; sort?: string };

export type UpdateWarehousePayload = SaveWarehouseDto & { id: number };

export type WarehouseStockQuery = { q?: string; below_min?: boolean; page?: number; size?: number; sort?: string };
