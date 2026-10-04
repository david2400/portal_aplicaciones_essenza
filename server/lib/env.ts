/** Server-only environment helpers – never import from client code. */

let has_warned_missing_api_base_url = false;

export const env = {
  /** Internal API base URL (server → backend, not exposed to the browser). */
  get api_base_url(): string {
    const candidates = [
      process.env.API_BASE_URL,
      process.env.NEXT_PUBLIC_API_BASE_URL,
      process.env.NEXT_PUBLIC_API_URL,
      process.env.NEXT_PUBLIC_BASE_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    ];

    const resolved_candidate = candidates.find(
      (candidate): candidate is string => Boolean(candidate),
    );

    const dev_fallback =
      process.env.NODE_ENV !== 'production'
        ? `http://localhost:${process.env.PORT ?? 3000}`
        : undefined;

    const url = resolved_candidate ?? dev_fallback ?? '';

    if (!resolved_candidate && dev_fallback && !has_warned_missing_api_base_url) {
      console.warn(
        `⚠️  [env] API_BASE_URL is not configured. Defaulting to ${dev_fallback}. ` +
          'Set API_BASE_URL (or NEXT_PUBLIC_API_BASE_URL) to silence this warning.',
      );
      has_warned_missing_api_base_url = true;
    }

    if (!url) {
      throw new Error('[env] API_BASE_URL is not configured. Set it in your .env file.');
    }

    return url.replace(/\/+$/, '');
  },

  /**
   * Base URL del servicio `parametros` (catálogos compartidos: países,
   * departamentos, ciudades…). Es un backend distinto del de Essenza, con su
   * propio host/puerto; mismo patrón que `parametrosBaseUrl` en apps/draco.
   */
  get parametros_base_url(): string {
    const resolved_candidate = [
      process.env.PARAMETROS_API_URL,
      process.env.NEXT_PUBLIC_PARAMETROS_API_URL,
    ].find((candidate): candidate is string => Boolean(candidate));

    const dev_fallback =
      process.env.NODE_ENV !== 'production'
        ? `http://localhost:${process.env.DEV_PARAMETROS_PORT ?? 8001}`
        : undefined;

    const url = resolved_candidate ?? dev_fallback ?? '';

    if (!url) {
      throw new Error('[env] PARAMETROS_API_URL is not configured. Set it in your .env file.');
    }

    return url.replace(/\/+$/, '');
  },

  get is_dev(): boolean {
    return process.env.NODE_ENV === 'development';
  },

  get is_prod(): boolean {
    return process.env.NODE_ENV === 'production';
  },
} as const;
