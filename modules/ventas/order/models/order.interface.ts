/** @format */

import type {
  OrderDto,
  CreateOrderDto,
  UpdateOrderDto,
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
export type IOrderProduct = { id?: number; name?: string; unitPrice?: number };
