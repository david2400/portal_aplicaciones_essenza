/** @format */

import type {
  CreatePageDto,
  PageDto,
  UpdatePagePayload,
} from "@/server/domains/cms/pages/types";

/**
 * Tipos del módulo CMS. Se reutilizan los tipos de `server/` (import de
 * solo tipos: no arrastra código de servidor al cliente).
 */
export type ICmsPage = PageDto;
export type ICmsPageCreateRequest = CreatePageDto;
export type ICmsPageUpdateRequest = UpdatePagePayload;
