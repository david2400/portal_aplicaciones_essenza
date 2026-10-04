/** @format */

import type {
  BrandDto,
  CreateBrandDto,
  UpdateBrandDto,
} from "@/server/domains/catalog/brands/types";

/**
 * Tipos del módulo. Se reutilizan los DTO generados desde `endpoint.json`
 * (import de solo tipos: no arrastra código de servidor al cliente).
 */
export type IBrand = BrandDto;
export type IBrandCreateRequest = CreateBrandDto;
export type IBrandUpdateRequest = UpdateBrandDto;
