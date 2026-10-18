/** @format */

import type {
  ChangeSupplierStatusDto,
  SaveSupplierDto,
  SaveSupplierProductDto,
  SupplierContactDto,
  SupplierDto,
  SupplierProductDto,
  SupplierStatsDto,
} from "@/server/domains/inventory/suppliers/types";

/**
 * Tipos del módulo. Se reutilizan los DTO generados desde `endpoint.json`
 * (import de solo tipos: no arrastra código de servidor al cliente).
 */
export type ISupplier = SupplierDto;
export type ISupplierSave = SaveSupplierDto;
export type ISupplierContact = SupplierContactDto;
export type ISupplierStats = SupplierStatsDto;
export type ISupplierStatusChange = ChangeSupplierStatusDto;
export type ISupplierProduct = SupplierProductDto;
export type ISupplierProductSave = SaveSupplierProductDto;

export const SUPPLIERS_HREF = "/inventory/suppliers";

export const SUPPLIER_STATUSES = ["ACTIVE", "BLOCKED", "INACTIVE"] as const;
export type SupplierStatus = (typeof SUPPLIER_STATUSES)[number];
export const isSupplierStatus = (value?: string): value is SupplierStatus =>
  SUPPLIER_STATUSES.includes(value as SupplierStatus);

export const DOC_TYPES = ["NIT", "CC", "CE", "PP", "PEP", "NIT_EXT"] as const;
export const PERSON_TYPES = ["JURIDICA", "NATURAL"] as const;
export const TAX_REGIMES = ["RESPONSABLE_IVA", "NO_RESPONSABLE_IVA", "SIMPLE"] as const;
export const CONTACT_AREAS = ["VENTAS", "CARTERA", "LOGISTICA", "GERENCIA", "OTRO"] as const;
export const ACCOUNT_TYPES = ["AHORROS", "CORRIENTE"] as const;
/** Plazos de pago habituales (días); 0 = contado. */
export const PAYMENT_TERMS = [0, 15, 30, 45, 60, 90] as const;
export const CURRENCIES = ["COP", "USD", "EUR"] as const;

/** Persona natural con documento distinto de NIT; jurídica con NIT. */
export const defaultPersonType = (docType: string) => (docType === "NIT" || docType === "NIT_EXT" ? "JURIDICA" : "NATURAL");
