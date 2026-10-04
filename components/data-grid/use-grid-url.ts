/** @format */

"use client";

import { useCallback, useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DEFAULT_PAGE_SIZE, sortFromParam, sortToParam, type SortState } from "@/shared/models/pagination";

type Patch = Record<string, string | number | null | undefined>;

/**
 * Estado de un listado en la URL (búsqueda, página, tamaño, orden y
 * filtros). Ventajas: se puede compartir/recargar la vista exacta, el
 * botón "atrás" funciona y el Server Component vuelve a pedir los datos.
 * `isPending` indica que la nueva página se está cargando.
 */
export function useGridUrl(defaultSize = DEFAULT_PAGE_SIZE) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const state = useMemo(
    () => ({
      q: params.get("q") ?? "",
      page: Math.max(Number(params.get("page") ?? 1) || 1, 1) - 1,
      size: Number(params.get("size")) || defaultSize,
      sort: sortFromParam(params.get("sort")),
      get: (key: string) => params.get(key) ?? "",
    }),
    [params, defaultSize],
  );

  /** Aplica cambios; salvo que se cambie la página, vuelve a la primera. */
  const update = useCallback(
    (patch: Patch) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value == null || value === "") next.delete(key);
        else next.set(key, String(value));
      }
      if (!("page" in patch)) next.delete("page");
      if (next.get("page") === "1") next.delete("page");
      const query = next.toString();
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    },
    [params, pathname, router],
  );

  const setSort = useCallback(
    (sort: SortState | null) => update({ sort: sortToParam(sort) || null }),
    [update],
  );

  const reset = useCallback(() => {
    startTransition(() => router.replace(pathname, { scroll: false }));
  }, [pathname, router]);

  const refresh = useCallback(() => startTransition(() => router.refresh()), [router]);

  return { ...state, update, setSort, reset, refresh, isPending };
}
