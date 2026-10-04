/** @format */

import type {
  CreateDispatchProductDto,
  DispatchProductDto,
  DispatchProductShippingEstimateDto,
  UpdateDispatchProductPayload,
} from "@/server/domains/shipping_logistics/dispatch/dispatch-products/types";
import type {
  DispatchDetailDto,
  TrackingDto,
} from "@/server/domains/shipping_logistics/product_distribution/shipping-logistics/types";

/**
 * Tipos del módulo de despachos. Se reutilizan los DTO generados desde
 * `endpoint.json` (import de solo tipos: no arrastra código de servidor).
 */
export type IDispatch = DispatchProductDto;
export type IDispatchCreateRequest = CreateDispatchProductDto;
export type IDispatchUpdateRequest = UpdateDispatchProductPayload;
export type IDispatchLine = DispatchDetailDto;
export type IDispatchTracking = TrackingDto;
export type IShippingQuote = DispatchProductShippingEstimateDto;

/** Orden que puede despacharse. */
export interface IDispatchOrder {
  id?: number;
  name?: string;
}

/** Línea de la orden que puede incluirse en el despacho. */
export interface IDispatchOrderLine {
  id?: number;
  productName: string;
  quantity: number;
}

/** Transportadora usada en el cotizador. */
export interface IDispatchCarrier {
  id?: number;
  name?: string;
  code?: string;
}
