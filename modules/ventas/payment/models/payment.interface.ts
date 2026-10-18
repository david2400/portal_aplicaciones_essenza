/** @format */

import type {
  CheckoutDto,
  OrderPaymentsDto,
  PaymentAction,
  PaymentDto,
  PaymentEventDto,
  PaymentsSummaryDto,
  RegisterPaymentDto,
  StartCheckoutDto,
} from "@/server/domains/sales/payments/types";

export type IPayment = PaymentDto;
export type IPaymentEvent = PaymentEventDto;
export type IOrderPayments = OrderPaymentsDto;
export type IPaymentsSummary = PaymentsSummaryDto;
export type IRegisterPaymentRequest = RegisterPaymentDto;
export type IStartCheckoutRequest = StartCheckoutDto;
export type ICheckout = CheckoutDto;
export type { PaymentAction };

export const PAYMENT_STATUSES = ["PENDING", "APPROVED", "DECLINED", "EXPIRED", "VOIDED", "REFUNDED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_ACTIONS = ["confirm", "decline", "void", "refund", "sync"] as const;

export const ORDER_PAYMENT_STATUSES = ["UNPAID", "PARTIAL", "PAID", "OVERPAID"] as const;
export type OrderPaymentStatus = (typeof ORDER_PAYMENT_STATUSES)[number];

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export const PAYMENT_STATUS_VARIANT: Record<PaymentStatus, BadgeVariant> = {
  PENDING: "outline",
  APPROVED: "default",
  DECLINED: "destructive",
  EXPIRED: "outline",
  VOIDED: "secondary",
  REFUNDED: "secondary",
};

export const ORDER_PAYMENT_VARIANT: Record<OrderPaymentStatus, BadgeVariant> = {
  UNPAID: "outline",
  PARTIAL: "secondary",
  PAID: "default",
  OVERPAID: "destructive",
};

export const isPaymentStatus = (value: unknown): value is PaymentStatus => PAYMENT_STATUSES.includes(value as PaymentStatus);
export const isOrderPaymentStatus = (value: unknown): value is OrderPaymentStatus =>
  ORDER_PAYMENT_STATUSES.includes(value as OrderPaymentStatus);
export const isPaymentAction = (value: unknown): value is PaymentAction => PAYMENT_ACTIONS.includes(value as PaymentAction);
