/** @format */

"use client";

import type { TaxonomyActions } from "../../shared/models";
import type { ICategory } from "../models/category.interface";
import {
  bulkDeleteCategoriesServerAction,
  createCategoryServerAction,
  deleteCategoryServerAction,
  exportCategoriesServerAction,
  updateCategoryServerAction,
} from "@/app/[locale]/catalogo/category/actions";

/**
 * Acciones de categoría que consume el gestor común. El formulario en sí es
 * `FormCategory` (scenes), que reutiliza el formulario de taxonomías.
 */
export const categoryActions: TaxonomyActions<ICategory> = {
  create: (values) => createCategoryServerAction(values),
  update: (id, values) => updateCategoryServerAction(id, values),
  remove: (id) => deleteCategoryServerAction(id),
  bulkRemove: (ids) => bulkDeleteCategoriesServerAction(ids),
  exportAll: (params) => exportCategoriesServerAction(params),
};
