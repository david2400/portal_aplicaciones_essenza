/** @format */

import { validationTaxonomy } from "../../shared/schemas/taxonomy.schema";

/** Mismas reglas que marca/categoría más la categoría padre obligatoria. */
export const validationSubcategory = () => validationTaxonomy({ withCategory: true });
