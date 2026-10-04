/** @format */

import type {
  UnitMeasurementDto,
  CreateUnitMeasurementDto,
  UpdateUnitMeasurementDto,
} from "@/server/domains/product_details/unit-measurements/types";

/**
 * Tipos del módulo. Se reutilizan los DTO generados desde `endpoint.json`
 * (import de solo tipos: no arrastra código de servidor al cliente).
 */
export type IUnitMeasurement = UnitMeasurementDto;
export type IUnitMeasurementCreateRequest = CreateUnitMeasurementDto;
export type IUnitMeasurementUpdateRequest = UpdateUnitMeasurementDto;
