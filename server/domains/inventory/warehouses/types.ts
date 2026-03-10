import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type WarehouseDto = components['schemas']['WarehouseDto'];
export type CreateWarehouseDto = components['schemas']['CreateWarehouseDto'];
export type UpdateWarehouseDto = components['schemas']['UpdateWarehouseDto'];
export type PageWarehouseDto = components['schemas']['PageWarehouseDto'];
export type ListWarehousesParams = components['schemas']['Pageable'];

export type UpdateWarehousePayload = UpdateWarehouseDto;
