/** @format */

import type {
  SupplierDto,
  CreateSupplierDto,
  UpdateSupplierDto,
} from "@/server/domains/inventory/suppliers/types";

/**
 * Tipos del módulo. Se reutilizan los DTO generados desde `endpoint.json`
 * (import de solo tipos: no arrastra código de servidor al cliente).
 */
export type ISupplier = SupplierDto;
export type ISupplierCreateRequest = CreateSupplierDto;
export type ISupplierUpdateRequest = UpdateSupplierDto;
