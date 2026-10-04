/** @format */

import type {
  WarehouseDto,
  CreateWarehouseDto,
  UpdateWarehouseDto,
} from "@/server/domains/inventory/warehouses/types";

/**
 * Tipos del módulo. Se reutilizan los DTO generados desde `endpoint.json`
 * (import de solo tipos: no arrastra código de servidor al cliente).
 */
export type IWarehouse = WarehouseDto;
export type IWarehouseCreateRequest = CreateWarehouseDto;
export type IWarehouseUpdateRequest = UpdateWarehouseDto;
