/** @format */

import type { ResolutionDto, SaveResolutionDto } from "@/server/domains/billing/resolutions/types";

export type IResolution = ResolutionDto;
export type IResolutionSaveRequest = SaveResolutionDto;

export const RESOLUTION_KINDS = ["INVOICE", "CREDIT_NOTE"] as const;
export type ResolutionKind = (typeof RESOLUTION_KINDS)[number];
export const BILLING_ENVIRONMENTS = ["TEST", "PRODUCTION"] as const;
export type BillingEnvironment = (typeof BILLING_ENVIRONMENTS)[number];
export const RESOLUTION_ALERTS = ["EXPIRED", "EXPIRING", "EXHAUSTED", "LOW"] as const;
export type ResolutionAlert = (typeof RESOLUTION_ALERTS)[number];
export const isResolutionAlert = (value: unknown): value is ResolutionAlert => RESOLUTION_ALERTS.includes(value as ResolutionAlert);
