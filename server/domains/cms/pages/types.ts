import 'server-only';

/**
 * Tipos escritos a mano: estos endpoints no están en `endpoint.json`
 * (`essenza-openapi-types.ts`). Reflejan `CreatePageDto` / `PageDto` del backend.
 * Obligatorios al crear: title, content.
 */
export type CreatePageDto = {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  /** DRAFT | PUBLISHED | ARCHIVED | SCHEDULED (texto libre, máx. 30). */
  status?: string;
  template?: string;
  isFeatured?: boolean;
  sortOrder?: number;
  /** `LocalDateTime` (yyyy-MM-ddTHH:mm:ss). */
  publishedAt?: string;
  /** `LocalDateTime` (yyyy-MM-ddTHH:mm:ss). */
  scheduledAt?: string;
  authorName?: string;
  featuredImage?: string;
  /** STATIC | LANDING | BLOG | CATEGORY. */
  pageType?: string;
  /** JSON serializado con campos adicionales. */
  customFields?: string;
};

/** `UpdatePageDto` no extiende al de creación: todos los campos son opcionales. */
export type UpdatePageDto = Partial<CreatePageDto>;

export type PageDto = Partial<CreatePageDto> & {
  id?: number;
  deleted?: boolean;
  usrCrea?: number;
  usrMod?: number;
  /** ISO-8601 (`Instant`). */
  createdAt?: string;
  /** ISO-8601 (`Instant`). */
  updatedAt?: string;
};

export type CreatePagePayload = CreatePageDto;
export type UpdatePagePayload = UpdatePageDto & { id: number };

export type DeletePagePayload = {
  id: number;
};
