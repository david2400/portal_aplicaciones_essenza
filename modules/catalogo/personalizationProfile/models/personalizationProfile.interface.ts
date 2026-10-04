/** @format */

import type {
  CreatePersonalizationProfileDto,
  PersonalizationProfileDto,
  UpdatePersonalizationProfilePayload,
} from "@/server/domains/advanced_features/personalization-profiles/types";

/**
 * Tipos del módulo. Se reutilizan los tipos de `server/` (import de solo
 * tipos: no arrastra código de servidor al cliente).
 */
export type IPersonalizationProfile = PersonalizationProfileDto;
export type IPersonalizationProfileCreateRequest = CreatePersonalizationProfileDto;
export type IPersonalizationProfileUpdateRequest = UpdatePersonalizationProfilePayload;
