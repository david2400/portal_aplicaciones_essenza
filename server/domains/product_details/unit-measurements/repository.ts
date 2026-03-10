import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { unit_measurements_tags } from '@/server/lib/cache-tags';
import type {
  UnitMeasurementDto,
  CreateUnitMeasurementDto,
  UpdateUnitMeasurementPayload,
} from './types';

const unit_measurements_base_path = '/api/shop/product_details/unit_measurements';
const unit_measurement_by_id_path = (id: number) => `${unit_measurements_base_path}/${id}`;

export const unit_measurements_repository = {
  async list_unit_measurements(): Promise<UnitMeasurementDto[]> {
    return server_fetch.get<UnitMeasurementDto[]>(unit_measurements_base_path, {
      revalidate: 60,
      tags: [unit_measurements_tags.list()],
    });
  },

  async get_unit_measurement_by_id(id: number): Promise<UnitMeasurementDto> {
    return server_fetch.get<UnitMeasurementDto>(unit_measurement_by_id_path(id), {
      revalidate: 60,
      tags: [unit_measurements_tags.item(id)],
    });
  },

  async create_unit_measurement(payload: CreateUnitMeasurementDto): Promise<UnitMeasurementDto> {
    return server_fetch.post<UnitMeasurementDto>(unit_measurements_base_path, payload, {
      revalidate: false,
    });
  },

  async update_unit_measurement(
    payload: UpdateUnitMeasurementPayload,
  ): Promise<UnitMeasurementDto> {
    return server_fetch.put<UnitMeasurementDto>(unit_measurement_by_id_path(payload.id), payload, {
      revalidate: false,
    });
  },

  async delete_unit_measurement(id: number): Promise<void> {
    return server_fetch.delete<void>(unit_measurement_by_id_path(id), {
      revalidate: false,
    });
  },
} as const;
