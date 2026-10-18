/** @format */

"use client";

import type { PageResult } from "@/shared/models/pagination";
import { WarehouseDetail } from "../components/warehouse-detail";
import type {
  IWarehouse,
  IWarehouseLinks,
  IWarehouseLocation,
  IWarehouseMovement,
  IWarehouseStock,
} from "../models/warehouse.interface";

/** Ficha de la bodega (`/[id]`). */
export const WarehouseDetailScene = (props: {
  warehouse: IWarehouse;
  stock: PageResult<IWarehouseStock>;
  stockQuery: { q: string; belowMin: boolean };
  movements: IWarehouseMovement[];
  links: IWarehouseLinks;
  locations: IWarehouseLocation[];
}) => <WarehouseDetail {...props} />;
