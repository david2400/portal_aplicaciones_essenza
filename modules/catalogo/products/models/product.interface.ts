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
export type IProductUpdateRequest = UpdateProductDto & { id: number };

/** Estados editoriales del catálogo (Fase 2). Solo ACTIVE está publicado. */
export const PRODUCT_STATUSES = ["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const statusOf = (product: Pick<IProduct, "status" | "available">): ProductStatus =>
  (product.status as ProductStatus | undefined) ?? (product.available ? "ACTIVE" : "INACTIVE");
