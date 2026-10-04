/** @format */

"use client";

import type { TaxonomyActions } from "../../shared/models";
import type { ISubcategory } from "../models/subcategory.interface";
import {
  bulkDeleteSubcategoriesServerAction,
  createSubcategoryServerAction,
  deleteSubcategoryServerAction,
  exportSubcategoriesServerAction,
  updateSubcategoryServerAction,
} from "@/app/[locale]/catalogo/subcategory/actions";

/**
 * Acciones de subcategoría que consume el gestor común. El formulario en sí es
 * `FormSubcategory` (scenes), que reutiliza el formulario de taxonomías.
 */
export const subcategoryActions: TaxonomyActions<ISubcategory> = {
  create: (values) => createSubcategoryServerAction(values),
  update: (id, values) => updateSubcategoryServerAction(id, values),
  remove: (id) => deleteSubcategoryServerAction(id),
  bulkRemove: (ids) => bulkDeleteSubcategoriesServerAction(ids),
  exportAll: (params) => exportSubcategoriesServerAction(params),
};
