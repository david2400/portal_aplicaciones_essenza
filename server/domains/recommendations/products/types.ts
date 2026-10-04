import 'server-only';

/**
 * Tipos escritos a mano: estos endpoints no están en `endpoint.json`
 * (`essenza-openapi-types.ts`). Reflejan `CreateProductRecommendationDto` / `ProductRecommendationDto` del backend.
 * Obligatorios al crear: customerId, productId.
 */
export type CreateProductRecommendationDto = {
  customerId: number;
  productId: number;
  productName?: string;
  productImageUrl?: string;
  productPrice?: number;
  /** COLLABORATIVE | CONTENT_BASED | TRENDING | CROSS_SELL | UP_SELL. */
  recommendationType?: string;
  /** Relevancia 0.0 – 1.0. */
  score?: number;
  reason?: string;
  position?: number;
  isClicked?: boolean;
  isPurchased?: boolean;
  /** HOME | PRODUCT_PAGE | CART | CHECKOUT. */
  context?: string;
};

/** `UpdateProductRecommendationDto` no extiende al de creación: todos los campos son opcionales. */
export type UpdateProductRecommendationDto = Partial<CreateProductRecommendationDto>;

export type ProductRecommendationDto = Partial<CreateProductRecommendationDto> & {
  id?: number;
  deleted?: boolean;
  usrCrea?: number;
  usrMod?: number;
  /** ISO-8601 (`Instant`). */
  createdAt?: string;
  /** ISO-8601 (`Instant`). */
  updatedAt?: string;
};

export type CreateProductRecommendationPayload = CreateProductRecommendationDto;
export type UpdateProductRecommendationPayload = UpdateProductRecommendationDto & { id: number };

export type DeleteProductRecommendationPayload = {
  id: number;
};
