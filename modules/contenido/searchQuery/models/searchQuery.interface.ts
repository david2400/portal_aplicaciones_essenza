/** @format */

import type { SearchQueryDto } from "@/server/domains/smart_search/queries/types";

/** Búsqueda registrada por la tienda (solo tipos: no arrastra código de servidor). */
export type ISearchQuery = SearchQueryDto;

/** Término agregado: varias búsquedas con el mismo texto normalizado. */
export interface ISearchTerm {
  term: string;
  count: number;
  avgResults: number;
  zeroResults: number;
  lastSeen?: string;
}
