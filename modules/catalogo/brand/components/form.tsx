/** @format */

"use client";

import type { TaxonomyActions } from "../../shared/models";
import type { IBrand } from "../models/brand.interface";
import {
  bulkDeleteBrandsServerAction,
  createBrandServerAction,
  deleteBrandServerAction,
  exportBrandsServerAction,
  updateBrandServerAction,
} from "@/app/[locale]/catalogo/brand/actions";

/**
 * Acciones de marca que consume el gestor común. El formulario en sí es
 * `FormBrand` (scenes), que reutiliza el formulario de taxonomías.
 */
export const brandActions: TaxonomyActions<IBrand> = {
  create: (values) => createBrandServerAction(values),
  update: (id, values) => updateBrandServerAction(id, values),
  remove: (id) => deleteBrandServerAction(id),
  bulkRemove: (ids) => bulkDeleteBrandsServerAction(ids),
  exportAll: (params) => exportBrandsServerAction(params),
};
