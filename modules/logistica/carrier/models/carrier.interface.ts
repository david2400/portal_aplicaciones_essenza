/** @format */

import type {
  CarrierDto,
  CreateCarrierDto,
  UpdateCarrierPayload,
} from "@/server/domains/shipping_logistics/product_distribution/carriers/types";

/**
 * Tipos del módulo. Se reutilizan los DTO generados desde `endpoint.json`
 * (import de solo tipos: no arrastra código de servidor al cliente).
 */
export type ICarrier = CarrierDto;
export type ICarrierCreateRequest = CreateCarrierDto;
export type ICarrierUpdateRequest = UpdateCarrierPayload;
