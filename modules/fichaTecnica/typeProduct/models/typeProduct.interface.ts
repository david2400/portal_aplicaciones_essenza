/** @format */

import type {
  TypeProductDto,
  CreateTypeProductDto,
  UpdateTypeProductDto,
} from "@/server/domains/product_details/type-products/types";

/**
 * Tipos del módulo. Se reutilizan los DTO generados desde `endpoint.json`
 * (import de solo tipos: no arrastra código de servidor al cliente).
 */
export type ITypeProduct = TypeProductDto;
export type ITypeProductCreateRequest = CreateTypeProductDto;
export type ITypeProductUpdateRequest = UpdateTypeProductDto;
