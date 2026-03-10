import 'server-only';

import { cookies, headers as next_headers } from 'next/headers';

import { env } from './env';
import { ServerApiError, type ServerFetchOptions } from './types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function build_url(path: string, params?: Record<string, unknown>): string {
  const url = new URL(path, env.api_base_url);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function get_auth_headers(): Promise<Record<string, string>> {
  try {
    const cookie_store = await cookies();
    const token =
      cookie_store.get('next-auth.session-token')?.value ??
      cookie_store.get('__Secure-next-auth.session-token')?.value;

    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  } catch {
    // Outside of a request context (e.g. build time) – skip auth.
  }
  return {};
}

async function forwarded_headers(): Promise<Record<string, string>> {
  try {
    const req_headers = await next_headers();
    const forwarded: Record<string, string> = {};
    const accept_lang = req_headers.get('accept-language');
    if (accept_lang) forwarded['Accept-Language'] = accept_lang;
    return forwarded;
  } catch {
    return {};
  }
}

async function handle_response<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = await response.text().catch(() => null);
    }

    const message =
      (body as any)?.message ??
      (body as any)?.error ??
      `API request failed with status ${response.status}`;

    throw new ServerApiError({
      message,
      status: response.status,
      code: (body as any)?.code,
      details: body,
    });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// ─── Core fetch wrapper ─────────────────────────────────────────────────────

async function server_request<T>(
  method: string,
  path: string,
  opts: ServerFetchOptions & {
    body?: unknown;
    params?: Record<string, unknown>;
  } = {},
): Promise<T> {
  const { body, params, revalidate, tags, signal, headers: extra_headers } = opts;

  const [auth_headers, fwd_headers] = await Promise.all([
    get_auth_headers(),
    forwarded_headers(),
  ]);

  const url = build_url(path, params);

  const fetch_options: RequestInit & { next?: Record<string, unknown> } = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...auth_headers,
      ...fwd_headers,
      ...extra_headers,
    },
    signal,
    next: {},
  };

  if (revalidate !== undefined) {
    fetch_options.next!.revalidate = revalidate;
  }
  if (tags?.length) {
    fetch_options.next!.tags = tags;
  }

  if (body !== undefined && method !== 'GET' && method !== 'HEAD') {
    fetch_options.body = JSON.stringify(body);
  }

  if (env.is_dev) {
    console.log(`[server-fetch] ${method} ${url}`);
  }

  const response = await fetch(url, fetch_options);
  return handle_response<T>(response);
}

// ─── Public API ─────────────────────────────────────────────────────────────

export const server_fetch = {
  get<T>(path: string, opts?: ServerFetchOptions & { params?: Record<string, unknown> }) {
    return server_request<T>('GET', path, opts);
  },

  post<T>(path: string, body?: unknown, opts?: ServerFetchOptions) {
    return server_request<T>('POST', path, { ...opts, body });
  },

  put<T>(path: string, body?: unknown, opts?: ServerFetchOptions) {
    return server_request<T>('PUT', path, { ...opts, body });
  },

  patch<T>(path: string, body?: unknown, opts?: ServerFetchOptions) {
    return server_request<T>('PATCH', path, { ...opts, body });
  },

  delete<T>(path: string, opts?: ServerFetchOptions) {
    return server_request<T>('DELETE', path, opts);
  },
} as const;
