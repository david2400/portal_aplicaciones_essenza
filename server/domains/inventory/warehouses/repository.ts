import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { to_list } from '@/server/lib/list-response';
import { to_page_result } from '@/server/lib/pagination';
import { warehouses_tags } from '@/server/lib/cache-tags';
import type { PageResult } from '@/shared/models/pagination';
import type {
  ListWarehousesParams,
  PageWarehouseDto,
  SaveLocationDto,
  SaveWarehouseDto,
  UpdateWarehousePayload,
  WarehouseDto,
  WarehouseLinksDto,
  WarehouseLocationDto,
  WarehouseMovementDto,
  WarehouseStatsDto,
  WarehouseStockDto,
  WarehouseStockQuery,
} from './types';

const warehouses_base_path = '/api/shop/inventory/warehouses';
const by_id = (id: number) => `${warehouses_base_path}/${id}`;

function query_string(params: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '' && value !== false) search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : '';
}

export const warehouses_repository = {
  /** Página de bodegas (compatibilidad con selects y otros módulos). */
  async list_warehouses(params?: ListWarehousesParams): Promise<PageWarehouseDto> {
    return server_fetch.get<PageWarehouseDto>(`${warehouses_base_path}${query_string({ ...params })}`, {
      revalidate: 60,
      tags: [warehouses_tags.list()],
    });
  },

  async list_all(): Promise<WarehouseDto[]> {
    return to_list<WarehouseDto>(await this.list_warehouses({ page: 0, size: 200 }));
  },

  async get_stats(): Promise<WarehouseStatsDto> {
    return server_fetch.get<WarehouseStatsDto>(`${warehouses_base_path}/stats`, {
      revalidate: 30,
      tags: [warehouses_tags.list()],
    });
  },

  async get_warehouse(id: number): Promise<WarehouseDto> {
    return server_fetch.get<WarehouseDto>(by_id(id), { revalidate: 30, tags: [warehouses_tags.item(id), warehouses_tags.list()] });
  },

  async create_warehouse(payload: SaveWarehouseDto): Promise<WarehouseDto> {
    return server_fetch.post<WarehouseDto>(warehouses_base_path, payload, { revalidate: false });
  },

  async update_warehouse(payload: UpdateWarehousePayload): Promise<WarehouseDto> {
    const { id, ...body } = payload;
    return server_fetch.put<WarehouseDto>(by_id(id), body, { revalidate: false });
  },

  async set_active(id: number, active: boolean): Promise<WarehouseDto> {
    return server_fetch.post<WarehouseDto>(`${by_id(id)}/status?active=${active}`, undefined, { revalidate: false });
  },

  async set_main(id: number): Promise<WarehouseDto> {
    return server_fetch.post<WarehouseDto>(`${by_id(id)}/main`, undefined, { revalidate: false });
  },

  async delete_warehouse(id: number): Promise<void> {
    return server_fetch.delete<void>(by_id(id), { revalidate: false });
  },

  async stock(id: number, query: WarehouseStockQuery): Promise<PageResult<WarehouseStockDto>> {
    const size = query.size ?? 20;
    const response = await server_fetch.get<unknown>(
      `${by_id(id)}/stock${query_string({ q: query.q, belowMin: query.below_min, page: query.page ?? 0, size, sort: query.sort })}`,
      { revalidate: 15, tags: [warehouses_tags.item(id)] },
    );
    return to_page_result<WarehouseStockDto>(response, size);
  },

  async update_min(id: number, sku_id: number, min_threshold: number): Promise<WarehouseStockDto> {
    return server_fetch.put<WarehouseStockDto>(`${by_id(id)}/stock/${sku_id}/min`, { min_threshold }, { revalidate: false });
  },

  async movements(id: number, limit = 15): Promise<WarehouseMovementDto[]> {
    const response = await server_fetch.get<unknown>(`${by_id(id)}/movements?limit=${limit}`, {
      revalidate: 15,
      tags: [warehouses_tags.item(id)],
    });
    return to_list<WarehouseMovementDto>(response);
  },

  async links(id: number): Promise<WarehouseLinksDto> {
    return server_fetch.get<WarehouseLinksDto>(`${by_id(id)}/links`, { revalidate: 30, tags: [warehouses_tags.item(id)] });
  },

  async locations(id: number): Promise<WarehouseLocationDto[]> {
    const response = await server_fetch.get<unknown>(`${by_id(id)}/locations`, {
      revalidate: 30,
      tags: [warehouses_tags.item(id)],
    });
    return to_list<WarehouseLocationDto>(response);
  },

  async save_location(id: number, location_id: number | null, payload: SaveLocationDto): Promise<WarehouseLocationDto> {
    return location_id == null
      ? server_fetch.post<WarehouseLocationDto>(`${by_id(id)}/locations`, payload, { revalidate: false })
      : server_fetch.put<WarehouseLocationDto>(`${by_id(id)}/locations/${location_id}`, payload, { revalidate: false });
  },

  async delete_location(id: number, location_id: number): Promise<void> {
    return server_fetch.delete<void>(`${by_id(id)}/locations/${location_id}`, { revalidate: false });
  },
} as const;
