/** @format */

import type {
  ReturnMethodDto,
  CreateReturnMethodDto,
  UpdateReturnMethodPayload,
} from "@/server/domains/devolution/return-methods/types";

/**
 * Tipos del módulo. Se reutilizan los DTO generados desde `endpoint.json`
 * (import de solo tipos: no arrastra código de servidor al cliente).
 */
export type IReturnMethod = ReturnMethodDto;
export type IReturnMethodCreateRequest = CreateReturnMethodDto;
export type IReturnMethodUpdateRequest = UpdateReturnMethodPayload;
