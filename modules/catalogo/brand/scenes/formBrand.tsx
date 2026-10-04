/** @format */

"use client";

import { FormTaxonomy, type TaxonomyFormScene } from "../../shared/scenes/formTaxonomy";

/** Formulario de marca: el común de taxonomías con los textos de marca. */
export const FormBrand = (props: Omit<TaxonomyFormScene, "namespace" | "categoryOptions">) => (
  <FormTaxonomy namespace='Administre.brand' {...props} />
);
