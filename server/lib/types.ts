// ─── Generic API response wrappers ──────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// ─── Query params ───────────────────────────────────────────────────────────

export type ListParams = {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  q?: string;
  [key: string]: unknown;
};

// ─── Error types ────────────────────────────────────────────────────────────

export class ServerApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(opts: { message: string; status: number; code?: string; details?: unknown }) {
    super(opts.message);
    this.name = 'ServerApiError';
    this.status = opts.status;
    this.code = opts.code;
    this.details = opts.details;
  }

  get is_not_found(): boolean {
    return this.status === 404;
  }

  get is_unauthorized(): boolean {
    return this.status === 401;
  }

  get is_forbidden(): boolean {
    return this.status === 403;
  }

  get is_validation_error(): boolean {
    return this.status === 422;
  }
}

// ─── Cache tags ─────────────────────────────────────────────────────────────

export type CacheTag = `${string}:${string}` | string;

// ─── Fetch options ──────────────────────────────────────────────────────────

export interface ServerFetchOptions {
  /** Next.js revalidation in segundos. `false` = no cache. */
  revalidate?: number | false;
  /** Next.js cache tags para revalidación on-demand. */
  tags?: CacheTag[];
  /** AbortSignal para cancelación. */
  signal?: AbortSignal;
  /** Headers extra. */
  headers?: Record<string, string>;
}
