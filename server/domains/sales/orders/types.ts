import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type OrderDto = components['schemas']['OrderDto'];
export type CreateOrderDto = components['schemas']['CreateOrderDto'];
export type UpdateOrderDto = components['schemas']['UpdateOrderDto'];
export type ChangeOrderStatusDto = components['schemas']['ChangeOrderStatusDto'];
export type OrderReservationDto = components['schemas']['OrderReservationDto'];

// V16: orden empresarial
export type SaveOrderDetailsDto = components['schemas']['SaveOrderDetailsDto'];
export type CreateFullOrderDto = components['schemas']['CreateFullOrderDto'];
export type OrderSummaryDto = components['schemas']['OrderSummaryDto'];
export type OrderEventDto = components['schemas']['OrderEventDto'];
export type CustomerLookupDto = components['schemas']['CustomerLookupDto'];
export type CustomerByDocumentDto = components['schemas']['CustomerByDocumentDto'];
export type OrderNumberingDto = components['schemas']['OrderNumberingDto'];
export type PickOrderDto = components['schemas']['PickOrderDto'];
export type ShipOrderDto = components['schemas']['ShipOrderDto'];
export type OrderActionDto = components['schemas']['OrderActionDto'];
export type BulkOrderStatusDto = components['schemas']['BulkOrderStatusDto'];

export type CreateOrderPayload = CreateOrderDto;
export type UpdateOrderPayload = UpdateOrderDto;

export type DeleteOrderPayload = {
  id: number;
};

/** Filtros del listado (mismos nombres que el backend). */
export type OrderFilterParams = Partial<
  Record<'q' | 'state' | 'channel' | 'storeId' | 'priority' | 'deliveryMethod' | 'paymentStatus' | 'period' | 'overdue', string>
>;
