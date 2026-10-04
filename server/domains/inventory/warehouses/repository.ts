import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { warehouses_tags } from '@/server/lib/cache-tags';
import type {
  PageWarehouseDto,
  CreateWarehouseDto,
  UpdateWarehousePayload,
  ListWarehousesParams,
  WarehouseDto,
} from './types';

const warehouses_base_path = '/api/shop/inventory/warehouses';
const warehouse_by_id_path = (id: number) => `${warehouses_base_path}/${id}`;

function build_pageable_query(params?: ListWarehousesParams): string {
  if (!params) {
    return '';
  }

  const query = new URLSearchParams();

  if (params.page !== undefined) {
    query.set('page', String(params.page));
  }
  if (params.size !== undefined) {
    query.set('size', String(params.size));
  }
  params.sort?.forEach((value) => {
    if (value) {
      query.append('sort', value);
    }
  });

  const query_string = query.toString();
  return query_string ? `?${query_string}` : '';
}

export const warehouses_repository = {
  async list_warehouses(params?: ListWarehousesParams): Promise<PageWarehouseDto> {
    const query = build_pageable_query(params);
    return server_fetch.get<PageWarehouseDto>(`${warehouses_base_path}${query}`, {
      revalidate: 60,
      tags: [warehouses_tags.list()],
    });
  },

  async create_warehouse(payload: CreateWarehouseDto): Promise<WarehouseDto> {
    return server_fetch.post<WarehouseDto>(warehouses_base_path, payload, {
      revalidate: false,
    });
  },

  async update_warehouse(payload: UpdateWarehousePayload): Promise<WarehouseDto> {
    // `UpdateWarehouseDto` exige `id` en el cuerpo (@Valid @NotNull): se envía completo.
    return server_fetch.put<WarehouseDto>(warehouse_by_id_path(payload.id), payload, {
      revalidate: false,
    });
  },

  async delete_warehouse(id: number): Promise<void> {
    return server_fetch.delete<void>(warehouse_by_id_path(id), { revalidate: false });
  },
} as const;
