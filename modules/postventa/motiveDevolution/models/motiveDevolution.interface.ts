/** @format */

import type {
  MotiveDevolutionDto,
  CreateMotiveDevolutionDto,
  UpdateMotiveDevolutionPayload,
} from "@/server/domains/devolution/motive-devolutions/types";

/**
 * Tipos del módulo. Se reutilizan los DTO generados desde `endpoint.json`
 * (import de solo tipos: no arrastra código de servidor al cliente).
 */
export type IMotiveDevolution = MotiveDevolutionDto;
export type IMotiveDevolutionCreateRequest = CreateMotiveDevolutionDto;
export type IMotiveDevolutionUpdateRequest = UpdateMotiveDevolutionPayload;
