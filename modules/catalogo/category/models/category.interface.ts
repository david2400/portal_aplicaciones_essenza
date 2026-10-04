/** @format */

import type {
  CategoryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/server/domains/catalog/categories/types";

/**
 * Tipos del módulo. Se reutilizan los DTO generados desde `endpoint.json`
 * (import de solo tipos: no arrastra código de servidor al cliente).
 */
export type ICategory = CategoryDto;
export type ICategoryCreateRequest = CreateCategoryDto;
export type ICategoryUpdateRequest = UpdateCategoryDto;
