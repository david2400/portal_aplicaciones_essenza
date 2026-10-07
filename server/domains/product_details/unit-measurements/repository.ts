import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { unit_measurements_tags } from '@/server/lib/cache-tags';
import type { ListUnitsParams, SaveUnitDto, UnitConversionDto, UnitDto, UpdateUnitPayload } from './types';

/** Catálogo de unidades (antes `/product_details/unit_measurements`, hoy alias). */
const units_base_path = '/api/shop/catalog/units';
const unit_by_id_path = (id: number) => `${units_base_path}/${id}`;

export const units_repository = {
  async list_units(params: ListUnitsParams = {}): Promise<UnitDto[]> {
    return server_fetch.get<UnitDto[]>(units_base_path, {
      params,
      revalidate: 60,
      tags: [unit_measurements_tags.list()],
    });
  },

  async get_unit(id: number): Promise<UnitDto> {
    return server_fetch.get<UnitDto>(unit_by_id_path(id), {
      revalidate: 60,
      tags: [unit_measurements_tags.item(id)],
    });
  },

  async create_unit(payload: SaveUnitDto): Promise<UnitDto> {
    return server_fetch.post<UnitDto>(units_base_path, payload, { revalidate: false });
  },

  async update_unit({ id, ...body }: UpdateUnitPayload): Promise<UnitDto> {
    return server_fetch.put<UnitDto>(unit_by_id_path(id), body, { revalidate: false });
  },

  async delete_unit(id: number): Promise<void> {
    return server_fetch.delete<void>(unit_by_id_path(id), { revalidate: false });
  },

  async convert(params: { value: number; from: string; to: string }): Promise<UnitConversionDto> {
    return server_fetch.get<UnitConversionDto>(`${units_base_path}/convert`, { params, revalidate: false });
  },
} as const;
