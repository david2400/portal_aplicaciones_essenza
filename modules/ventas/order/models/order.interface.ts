/** @format */

import type {
  OrderDto,
  CreateOrderDto,
  UpdateOrderDto,
  OrderReservationDto,
  OrderSummaryDto,
  OrderEventDto,
  CustomerLookupDto,
  CustomerByDocumentDto,
  SaveOrderDetailsDto,
  CreateFullOrderDto,
  OrderNumberingDto,
} from "@/server/domains/sales/orders/types";
import type {
  ProductOrderDto,
  CreateProductOrderDto,
  UpdateProductOrderDto,
} from "@/server/domains/sales/product-orders/types";

/** Orden de venta (cabecera con cliente, entrega, origen, descuento y datos calculados). */
export type IOrder = OrderDto;
export type IOrderCreateRequest = CreateOrderDto;
export type IOrderUpdateRequest = UpdateOrderDto;

/** Ítem de una orden (producto, cantidad, descuento, preparación y totales). */
export type IOrderItem = ProductOrderDto;
export type IOrderItemCreateRequest = CreateProductOrderDto;
export type IOrderItemUpdateRequest = UpdateProductOrderDto;

/** Reserva de stock de una línea en una bodega. */
export type IOrderReservation = OrderReservationDto;

/** KPIs del listado (mismos filtros que la búsqueda). */
export type IOrderSummary = OrderSummaryDto;

/** Evento de la línea de tiempo. */
export type IOrderEvent = OrderEventDto;

/** Cliente de órdenes anteriores (para reutilizar sus datos). */
export type ICustomerLookup = CustomerLookupDto;

/** Persona por documento (registro central + historial de órdenes). */
export type ICustomerByDocument = CustomerByDocumentDto;

export type IOrderDetailsSave = SaveOrderDetailsDto;
export type IOrderFullCreate = CreateFullOrderDto;
export type IOrderNumbering = OrderNumberingDto;

export type INamedItem = { id?: number; name?: string };

/** Tienda con su bodega (para sugerir la bodega de despacho). */
export type IOrderStore = { id?: number; name?: string; warehouse_id?: number | null };

export const ORDERS_HREF = "/ventas/orders";
