/** @format */

import type {
  FeatureDto,
  CreateFeatureDto,
  UpdateFeatureDto,
} from "@/server/domains/product_details/features/types";

/**
 * Tipos del módulo. Se reutilizan los DTO generados desde `endpoint.json`
 * (import de solo tipos: no arrastra código de servidor al cliente).
 */
export type IFeature = FeatureDto;
export type IFeatureCreateRequest = CreateFeatureDto;
export type IFeatureUpdateRequest = UpdateFeatureDto;
