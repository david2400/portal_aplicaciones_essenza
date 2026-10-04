/** @format */

import type {
  ProductComboDto,
  CreateProductComboDto,
  UpdateProductComboDto,
} from "@/server/domains/inventory/product-combos/types";

/**
 * Tipos del módulo. Se reutilizan los DTO generados desde `endpoint.json`
 * (import de solo tipos: no arrastra código de servidor al cliente).
 */
export type ICombo = ProductComboDto;
export type IComboCreateRequest = CreateProductComboDto;
export type IComboUpdateRequest = UpdateProductComboDto;
