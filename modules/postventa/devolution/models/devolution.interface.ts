/** @format */

import type {
  OrderDevolutionDto,
  CreateOrderDevolutionDto,
  UpdateOrderDevolutionPayload,
} from "@/server/domains/devolution/order-devolutions/types";
import type {
  OrderDevolutionDetailDto,
  CreateOrderDevolutionDetailDto,
  UpdateOrderDevolutionDetailPayload,
} from "@/server/domains/devolution/order-devolution-details/types";
import type {
  OrderDevolutionEvidenceDto,
  CreateOrderDevolutionEvidenceDto,
} from "@/server/domains/devolution/order-devolution-evidences/types";

/**
 * Tipos del módulo de devoluciones. Se reutilizan los DTO generados desde
 * `endpoint.json` (import de solo tipos: no arrastra código de servidor).
 */
export type IDevolution = OrderDevolutionDto;
export type IDevolutionCreateRequest = CreateOrderDevolutionDto;
export type IDevolutionUpdateRequest = UpdateOrderDevolutionPayload;

export type IDevolutionDetail = OrderDevolutionDetailDto;
export type IDevolutionDetailCreateRequest = CreateOrderDevolutionDetailDto;
export type IDevolutionDetailUpdateRequest = UpdateOrderDevolutionDetailPayload;

export type IDevolutionEvidence = OrderDevolutionEvidenceDto;
export type IDevolutionEvidenceCreateRequest = CreateOrderDevolutionEvidenceDto;

/** Elemento de catálogo (motivo, método, orden…) para selects y lookups. */
export interface IDevolutionOption {
  id?: number;
  name?: string;
}

/** Línea de la orden original que puede devolverse. */
export interface IDevolutionOrderLine {
  id?: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

/** Catálogos que usa el formulario de devolución. */
export interface IDevolutionCatalogs {
  orders: IDevolutionOption[];
  motives: IDevolutionOption[];
  returnMethods: IDevolutionOption[];
  refundMethods: IDevolutionOption[];
}
