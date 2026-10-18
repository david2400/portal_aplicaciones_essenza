/** @format */

import type {
  SaveLocationDto,
  SaveWarehouseDto,
  WarehouseDto,
  WarehouseLinksDto,
  WarehouseLocationDto,
  WarehouseMovementDto,
  WarehouseStatsDto,
  WarehouseStockDto,
} from "@/server/domains/inventory/warehouses/types";

/**
 * Tipos del módulo. Se reutilizan los DTO generados desde `endpoint.json`
 * (import de solo tipos: no arrastra código de servidor al cliente).
 */
export type IWarehouse = WarehouseDto;
export type IWarehouseSave = SaveWarehouseDto;
export type IWarehouseStats = WarehouseStatsDto;
export type IWarehouseStock = WarehouseStockDto;
export type IWarehouseMovement = WarehouseMovementDto;
export type IWarehouseLinks = WarehouseLinksDto;
export type IWarehouseLocation = WarehouseLocationDto;
export type IWarehouseLocationSave = SaveLocationDto;

export const WAREHOUSES_HREF = "/inventory/warehouses";

export const WAREHOUSE_TYPES = ["ALMACEN", "TIENDA", "TRANSITO", "DEVOLUCIONES", "CONSIGNACION"] as const;
export type WarehouseType = (typeof WAREHOUSE_TYPES)[number];
export const isWarehouseType = (value?: string): value is WarehouseType => WAREHOUSE_TYPES.includes(value as WarehouseType);
/** Tipos que pueden ser la bodega principal. */
export const MAIN_TYPES: readonly WarehouseType[] = ["ALMACEN", "TIENDA"];

export const LOCATION_TYPES = ["STORAGE", "PICKING", "RECEIVING", "DISPATCH", "QUARANTINE"] as const;
