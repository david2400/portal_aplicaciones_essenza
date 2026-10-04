/** @format */

import type {
  PaymentTypeDto,
  CreatePaymentTypeDto,
  UpdatePaymentTypeDto,
} from "@/server/domains/sales/payment-types/types";

/**
 * Tipos del módulo. Se reutilizan los DTO generados desde `endpoint.json`
 * (import de solo tipos: no arrastra código de servidor al cliente).
 */
export type IPaymentType = PaymentTypeDto;
export type IPaymentTypeCreateRequest = CreatePaymentTypeDto;
export type IPaymentTypeUpdateRequest = UpdatePaymentTypeDto;
