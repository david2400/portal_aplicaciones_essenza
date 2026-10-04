/** @format */

import type {
  SubcategoryDto,
  CreateSubcategoryDto,
  UpdateSubcategoryDto,
} from "@/server/domains/catalog/subcategories/types";

/**
 * Tipos del módulo. Se reutilizan los DTO generados desde `endpoint.json`
 * (import de solo tipos: no arrastra código de servidor al cliente).
 */
export type ISubcategory = SubcategoryDto;
export type ISubcategoryCreateRequest = CreateSubcategoryDto;
export type ISubcategoryUpdateRequest = UpdateSubcategoryDto;
