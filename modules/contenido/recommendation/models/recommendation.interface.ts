/** @format */

import type {
  CreateProductRecommendationDto,
  ProductRecommendationDto,
  UpdateProductRecommendationPayload,
} from "@/server/domains/recommendations/products/types";

/**
 * Tipos del módulo. Se reutilizan los tipos de `server/` (import de solo
 * tipos: no arrastra código de servidor al cliente).
 */
export type IRecommendation = ProductRecommendationDto;
export type IRecommendationCreateRequest = CreateProductRecommendationDto;
export type IRecommendationUpdateRequest = UpdateProductRecommendationPayload;

/** Producto del catálogo que puede recomendarse. */
export interface IRecommendationProduct {
  id?: number;
  name?: string;
  unit_price?: number;
  image_url?: string;
}
