/** @format */

"use client";

import { FormTaxonomy, type TaxonomyFormScene } from "../../shared/scenes/formTaxonomy";

/** Formulario de subcategoría: el común de taxonomías con selector de categoría. */
export const FormSubcategory = (props: Omit<TaxonomyFormScene, "namespace">) => (
  <FormTaxonomy namespace='Administre.subcategory' {...props} />
);
