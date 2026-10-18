/** @format */

import type { SaveTaxRateDto, TaxRateDto } from "@/server/domains/billing/tax-rates/types";

export type ITaxRate = TaxRateDto;
export type ITaxRateSaveRequest = SaveTaxRateDto;

export const TAX_KINDS = ["IVA", "INC", "EXCLUDED"] as const;
export type TaxKind = (typeof TAX_KINDS)[number];
export const isTaxKind = (value: unknown): value is TaxKind => TAX_KINDS.includes(value as TaxKind);
