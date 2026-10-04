/** @format */

"use client";

import { HiOutlineTag } from "react-icons/hi2";
import type { PageResult } from "@/shared/models/pagination";
import { TaxonomyManager } from "../../shared/components/taxonomy-manager";
import type { TaxonomyStats } from "../../shared/models";
import type { IBrand } from "../models/brand.interface";
import { brandActions } from "./form";

interface IBrandManagerProps {
  page: PageResult<IBrand>;
  stats: TaxonomyStats;
}

/** Gestor de marcas: tabla paginada en servidor, lote, exportación y formulario. */
export const BrandManager = ({ page, stats }: IBrandManagerProps) => (
  <TaxonomyManager<IBrand>
    gridId='marcas'
    namespace='Administre.brand'
    icon={HiOutlineTag}
    page={page}
    stats={stats}
    actions={brandActions}
  />
);
