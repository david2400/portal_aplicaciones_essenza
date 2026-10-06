/** @format */

import type { ISearchQuery, ISearchTerm } from "./models/searchQuery.interface";

/** Normaliza el texto buscado para agrupar variantes ("Perfume ", "perfume"). */
export const normalizeTerm = (value?: string) =>
  (value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

/** Fecha de referencia de una búsqueda: última ejecución o creación. */
export const queryDate = (query: ISearchQuery) => query.last_run_at ?? query.created_at;

export const withinDays = (query: ISearchQuery, days: number | null) => {
  if (days == null) return true;
  const value = queryDate(query);
  if (!value) return false;
  const time = new Date(value).getTime();
  return !Number.isNaN(time) && Date.now() - time <= days * 86_400_000;
};

/** Agrupa las búsquedas por término y calcula sus métricas. */
export const aggregateTerms = (queries: ISearchQuery[]): ISearchTerm[] => {
  const map = new Map<string, { count: number; results: number; zero: number; lastSeen?: string }>();

  for (const query of queries) {
    const term = normalizeTerm(query.query);
    if (!term) continue;
    const entry = map.get(term) ?? { count: 0, results: 0, zero: 0 };
    entry.count += 1;
    entry.results += query.total_results ?? 0;
    if ((query.total_results ?? 0) === 0) entry.zero += 1;
    const date = queryDate(query);
    if (date && (!entry.lastSeen || date > entry.lastSeen)) entry.lastSeen = date;
    map.set(term, entry);
  }

  return [...map.entries()]
    .map(([term, entry]) => ({
      term,
      count: entry.count,
      avgResults: entry.results / entry.count,
      zeroResults: entry.zero,
      lastSeen: entry.lastSeen,
    }))
    .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term));
};
