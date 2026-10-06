/** @format */

import type {
  OrderDto,
  CreateOrderDto,
  UpdateOrderDto,
  OrderReservationDto,
} from "@/server/domains/sales/orders/types";
import type {
  ProductOrderDto,
  CreateProductOrderDto,
  UpdateProductOrderDto,
} from "@/server/domains/sales/product-orders/types";

/** Orden de venta (cabecera). */
export type IOrder = OrderDto;
export type IOrderCreateRequest = CreateOrderDto;
export type IOrderUpdateRequest = UpdateOrderDto;

/** Ítem de una orden (producto, cantidad, descuento y totales). */
export type IOrderItem = ProductOrderDto;
export type IOrderItemCreateRequest = CreateProductOrderDto;
export type IOrderItemUpdateRequest = UpdateProductOrderDto;

/** Producto mínimo que necesita la pantalla para nombrar y tasar ítems. */
export type IOrderProduct = { id?: number; name?: string; unit_price?: number };

/** SKU vendible para las líneas: el backend congela su precio, código y nombre. */
export type IOrderSku = { id: number; product_id?: number; code?: string; label: string; unit_price?: number };

/** Reserva de stock de una línea en una bodega. */
export type IOrderReservation = OrderReservationDto;

export type INamedItem = { id?: number; name?: string };
