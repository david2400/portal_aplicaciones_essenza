/** @format */

import type {
  BuyerDto,
  InvoiceDto,
  InvoiceLineDto,
  InvoiceTaxDto,
  InvoicesSummaryDto,
} from "@/server/domains/billing/invoices/types";
import type { BillingSettingsDto } from "@/server/domains/billing/settings/types";

export type IInvoice = InvoiceDto;
export type IInvoiceLine = InvoiceLineDto;
export type IInvoiceTax = InvoiceTaxDto;
export type IBuyer = BuyerDto;
export type IInvoicesSummary = InvoicesSummaryDto;
export type IBillingSettings = BillingSettingsDto;

export const INVOICE_STATUSES = ["PENDING", "ISSUED", "REJECTED", "VOIDED"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const INVOICE_KINDS = ["INVOICE", "CREDIT_NOTE"] as const;
export type InvoiceKind = (typeof INVOICE_KINDS)[number];

export const BUYER_DOC_TYPES = ["CC", "NIT", "CE", "PP", "TI", "PEP", "NIT_EXT"] as const;
export type BuyerDocType = (typeof BUYER_DOC_TYPES)[number];

export const FINAL_CONSUMER_NUMBER = "222222222222";

/** Estados de orden que se pueden facturar (pagada en adelante). */
export const BILLABLE_ORDER_STATES = ["PAID", "PROCESSING", "READY", "SHIPPED", "DELIVERED"];

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export const INVOICE_STATUS_VARIANT: Record<InvoiceStatus, BadgeVariant> = {
  PENDING: "outline",
  ISSUED: "default",
  REJECTED: "destructive",
  VOIDED: "secondary",
};

export const isInvoiceStatus = (value: unknown): value is InvoiceStatus => INVOICE_STATUSES.includes(value as InvoiceStatus);
export const isInvoiceKind = (value: unknown): value is InvoiceKind => INVOICE_KINDS.includes(value as InvoiceKind);
export const isBuyerDocType = (value: unknown): value is BuyerDocType => BUYER_DOC_TYPES.includes(value as BuyerDocType);
