import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type OrderDevolutionDto = components['schemas']['OrderDevolutionDto'];
export type CreateOrderDevolutionDto = components['schemas']['CreateOrderDevolutionDto'];
export type UpdateOrderDevolutionDto = components['schemas']['UpdateOrderDevolutionDto'];

export type UpdateOrderDevolutionPayload = UpdateOrderDevolutionDto;

/** Flujo conectado (V10): solicitud con líneas, acciones y lo que se puede devolver. */
export type ReturnRequestDto = components['schemas']['ReturnRequestDto'];
export type ReturnableOrderDto = components['schemas']['ReturnableOrderDto'];
export type ApproveReturnDto = components['schemas']['ApproveReturnDto'];
export type RejectReturnDto = components['schemas']['RejectReturnDto'];
export type ReceiveReturnDto = components['schemas']['ReceiveReturnDto'];
export type InspectReturnDto = components['schemas']['InspectReturnDto'];
export type RefundReturnDto = components['schemas']['RefundReturnDto'];

export type ReturnFlowAction = 'approve' | 'reject' | 'receive' | 'inspect' | 'refund';
export type ReturnFlowBody = ApproveReturnDto | RejectReturnDto | ReceiveReturnDto | InspectReturnDto | RefundReturnDto;

export type DeleteOrderDevolutionPayload = {
  id: number;
};
