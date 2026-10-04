import 'server-only';

/**
 * Tipos escritos a mano: estos endpoints no están en `endpoint.json`
 * (`essenza-openapi-types.ts`). Reflejan `CreatePersonalizationProfileDto` / `PersonalizationProfileDto` del backend.
 * Obligatorios al crear: customerId, segment.
 */
export type CreatePersonalizationProfileDto = {
  customerId: number;
  sessionId?: string;
  /** VIP | FREQUENT_BUYER | PRICE_SENSITIVE | BROWSER | NEW_CUSTOMER | CHURNING. */
  segment: string;
  status?: string;
  contextMetadataJson?: string;
  recommendedProductsJson?: string;
  dynamicPricingJson?: string;
  personalizedContentJson?: string;
  personalizedOffersJson?: string;
  uiPersonalizationJson?: string;
  purchaseIntentJson?: string;
  /** 0.0 – 1.0. */
  personalizationScore?: number;
  /** ISO-8601 (`Instant`). */
  lastAnalysisAt?: string;
};

/** `UpdatePersonalizationProfileDto` no extiende al de creación: todos los campos son opcionales. */
export type UpdatePersonalizationProfileDto = Partial<CreatePersonalizationProfileDto>;

export type PersonalizationProfileDto = Partial<CreatePersonalizationProfileDto> & {
  id?: number;
  deleted?: boolean;
  usrCrea?: number;
  usrMod?: number;
  /** ISO-8601 (`Instant`). */
  createdAt?: string;
  /** ISO-8601 (`Instant`). */
  updatedAt?: string;
};

export type CreatePersonalizationProfilePayload = CreatePersonalizationProfileDto;
export type UpdatePersonalizationProfilePayload = UpdatePersonalizationProfileDto & { id: number };

export type DeletePersonalizationProfilePayload = {
  id: number;
};
