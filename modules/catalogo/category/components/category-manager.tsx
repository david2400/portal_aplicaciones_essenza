/** @format */

"use client";

import { HiOutlineSquares2X2 } from "react-icons/hi2";
import type { PageResult } from "@/shared/models/pagination";
import { TaxonomyManager } from "../../shared/components/taxonomy-manager";
import type { TaxonomyStats } from "../../shared/models";
import type { ICategory } from "../models/category.interface";
import { categoryActions } from "./form";

interface ICategoryManagerProps {
  page: PageResult<ICategory>;
  stats: TaxonomyStats;
}

/** Gestor de categorías: tabla paginada en servidor, lote, exportación y formulario. */
export const CategoryManager = ({ page, stats }: ICategoryManagerProps) => (
  <TaxonomyManager<ICategory>
    gridId='categorias'
    namespace='Administre.category'
    icon={HiOutlineSquares2X2}
    page={page}
    stats={stats}
    actions={categoryActions}
  />
);
