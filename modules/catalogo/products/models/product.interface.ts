/** @format */

import type {
  ProductDto,
  CreateProductDto,
  UpdateProductDto,
} from "@/server/domains/inventory/products/types";

/**
 * Tipos del módulo. Se reutilizan los DTO generados desde `endpoint.json`
 * (import de solo tipos: no arrastra código de servidor al cliente).
 */
export type IProduct = ProductDto;
export type IProductCreateRequest = CreateProductDto;
export type IProductUpdateRequest = UpdateProductDto;
