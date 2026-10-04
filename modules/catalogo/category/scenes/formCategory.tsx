/** @format */

"use client";

import { FormTaxonomy, type TaxonomyFormScene } from "../../shared/scenes/formTaxonomy";

/** Formulario de categoría: el común de taxonomías con los textos de categoría. */
export const FormCategory = (props: Omit<TaxonomyFormScene, "namespace" | "categoryOptions">) => (
  <FormTaxonomy namespace='Administre.category' {...props} />
);
