/** @format */

import { validationTaxonomy } from "../../shared/schemas/taxonomy.schema";

/** Mismas reglas que el backend: nombre ≤ 150, slug opcional con formato URL. */
export const validationCategory = () => validationTaxonomy();
