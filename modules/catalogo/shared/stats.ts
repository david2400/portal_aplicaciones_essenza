/** @format */

import type { TaxonomyItem, TaxonomyStats } from "./models";
import { createdWithin } from "./utils";

/** KPIs del encabezado a partir de la lista completa (se calcula en el servidor). */
export const buildTaxonomyStats = (items: TaxonomyItem[], now = Date.now()): TaxonomyStats => ({
  total: items.length,
  withoutDescription: items.filter((item) => !item.description?.trim()).length,
  recent: items.filter((item) => createdWithin(item.createdAt, 30, now)).length,
});
