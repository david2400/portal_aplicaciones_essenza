/** @format */

import type {
  GatewayProviderDto,
  PaymentMethodDto,
  SavePaymentMethodDto,
} from "@/server/domains/sales/payment-methods/types";

/** Medio de pago (efectivo, datáfono, transferencia, billetera, pasarela, contraentrega). */
export type IPaymentMethod = PaymentMethodDto;
export type IPaymentMethodSaveRequest = SavePaymentMethodDto;
export type IGatewayProvider = GatewayProviderDto;

export const PAYMENT_CHANNELS = ["PHYSICAL", "VIRTUAL"] as const;
export type PaymentChannel = (typeof PAYMENT_CHANNELS)[number];

export const PAYMENT_KINDS = [
  "CASH",
  "CARD_TERMINAL",
  "BANK_TRANSFER",
  "DIGITAL_WALLET",
  "GATEWAY",
  "CASH_ON_DELIVERY",
  "OTHER",
] as const;
export type PaymentKind = (typeof PAYMENT_KINDS)[number];

export const GATEWAY_PROVIDERS = ["WOMPI", "MERCADO_PAGO", "SANDBOX"] as const;
export type GatewayProvider = (typeof GATEWAY_PROVIDERS)[number];

/** Canales en los que tiene sentido cada tipo (igual que el backend). */
export const KIND_CHANNELS: Record<PaymentKind, readonly PaymentChannel[]> = {
  CASH: ["PHYSICAL"],
  CARD_TERMINAL: ["PHYSICAL"],
  BANK_TRANSFER: ["PHYSICAL", "VIRTUAL"],
  DIGITAL_WALLET: ["PHYSICAL", "VIRTUAL"],
  GATEWAY: ["VIRTUAL"],
  CASH_ON_DELIVERY: ["PHYSICAL"],
  OTHER: ["PHYSICAL", "VIRTUAL"],
};

/** Solo efectivo y contraentrega dan cambio. */
export const KINDS_WITH_CHANGE: readonly PaymentKind[] = ["CASH", "CASH_ON_DELIVERY"];

export const kindsFor = (channel: PaymentChannel) => PAYMENT_KINDS.filter((kind) => KIND_CHANNELS[kind].includes(channel));

export const isPaymentKind = (value: unknown): value is PaymentKind => PAYMENT_KINDS.includes(value as PaymentKind);
export const isPaymentChannel = (value: unknown): value is PaymentChannel => PAYMENT_CHANNELS.includes(value as PaymentChannel);
export const isGatewayProvider = (value: unknown): value is GatewayProvider =>
  GATEWAY_PROVIDERS.includes(value as GatewayProvider);
