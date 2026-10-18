/** @format */

import type {
  OrderDevolutionDto,
  ReturnableOrderDto,
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

/** Lo que se puede devolver de una orden: vendido, ya devuelto y disponible por línea. */
export type IReturnableOrder = ReturnableOrderDto;
export type IReturnableLine = NonNullable<ReturnableOrderDto["lines"]>[number];

/** Nota crédito emitida por la devolución (de las facturas de la orden). */
export interface IReturnCreditNote {
  id?: number;
  full_number?: string;
  status?: string;
  total?: number;
}

/** Acciones del flujo que expone el backend en `actions`. */
export type ReturnAction = "approve" | "reject" | "receive" | "inspect" | "refund" | "edit_lines";

/** Catálogos que usa el formulario de devolución. */
export interface IDevolutionCatalogs {
  motives: IDevolutionOption[];
  returnMethods: IDevolutionOption[];
  refundMethods: IDevolutionOption[];
}
