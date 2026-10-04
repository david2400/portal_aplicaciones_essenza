import 'server-only';

/**
 * Tipos escritos a mano: estos endpoints no están en `endpoint.json`
 * (`essenza-openapi-types.ts`). Reflejan `CreateSearchQueryDto` / `SearchQueryDto` del backend.
 * Obligatorios al crear: query, page, pageSize.
 */
export type CreateSearchQueryDto = {
  customerId?: number;
  query: string;
  filtersJson?: string;
  sortBy?: string;
  page: number;
  pageSize: number;
  totalResults?: number;
  searchId?: string;
  /** ISO-8601 (`Instant`). */
  lastRunAt?: string;
};

/** `UpdateSearchQueryDto` no extiende al de creación: todos los campos son opcionales. */
export type UpdateSearchQueryDto = Partial<CreateSearchQueryDto>;

export type SearchQueryDto = Partial<CreateSearchQueryDto> & {
  id?: number;
  deleted?: boolean;
  usrCrea?: number;
  usrMod?: number;
  /** ISO-8601 (`Instant`). */
  createdAt?: string;
  /** ISO-8601 (`Instant`). */
  updatedAt?: string;
};

export type CreateSearchQueryPayload = CreateSearchQueryDto;
export type UpdateSearchQueryPayload = UpdateSearchQueryDto & { id: number };

export type DeleteSearchQueryPayload = {
  id: number;
};
