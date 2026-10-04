/** @format */

import type {
  RefundMethodDto,
  CreateRefundMethodDto,
  UpdateRefundMethodPayload,
} from "@/server/domains/devolution/refund-methods/types";

/**
 * Tipos del módulo. Se reutilizan los DTO generados desde `endpoint.json`
 * (import de solo tipos: no arrastra código de servidor al cliente).
 */
export type IRefundMethod = RefundMethodDto;
export type IRefundMethodCreateRequest = CreateRefundMethodDto;
export type IRefundMethodUpdateRequest = UpdateRefundMethodPayload;
