/** @format */

"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { HiOutlineRectangleStack } from "react-icons/hi2";
import { Badge } from "@repo/ui/badges/scenes/badge";
import type { GridColumn, GridFilter } from "@/components/data-grid";
import type { PageResult } from "@/shared/models/pagination";
import { TaxonomyManager } from "../../shared/components/taxonomy-manager";
import type { TaxonomyStats } from "../../shared/models";
import type { ISubcategory } from "../models/subcategory.interface";
import { subcategoryActions } from "./form";

interface ISubcategoryManagerProps {
  page: PageResult<ISubcategory>;
  stats: TaxonomyStats;
  categories: Array<{ id?: number; name?: string }>;
}

/** Gestor de subcategorías: igual que marcas/categorías más el filtro y la columna de categoría. */
export const SubcategoryManager = ({ page, stats, categories }: ISubcategoryManagerProps) => {
  const t = useTranslations("Administre.subcategory");

  const categoryNames = useMemo(
    () => new Map(categories.map((category) => [category.id ?? -1, category.name ?? `#${category.id}`])),
    [categories],
  );

  const options = useMemo(
    () =>
      categories
        .filter((category) => category.id != null)
        .map((category) => ({
          id: String(category.id),
          value: String(category.id),
          label: category.name ?? `#${category.id}`,
        })),
    [categories],
  );

  const extraColumns = useMemo<GridColumn<ISubcategory>[]>(
    () => [
      {
        id: "categoryId",
        header: t("fields.categoryId"),
        meta: {
          label: t("fields.categoryId"),
          exportValue: (row) => categoryNames.get(row.category_id ?? -1) ?? "",
        },
        cell: ({ row }) =>
          row.original.category_id != null ? (
            <Badge variant='outline'>{categoryNames.get(row.original.category_id) ?? `#${row.original.category_id}`}</Badge>
          ) : (
            "—"
          ),
      },
    ],
    [categoryNames, t],
  );

  const filters = useMemo<GridFilter<ISubcategory>[]>(
    () => [{ id: "categoryId", label: t("fields.categoryId"), options: options.map(({ value, label }) => ({ value, label })) }],
    [options, t],
  );

  return (
    <TaxonomyManager<ISubcategory>
      gridId='subcategorias'
      namespace='Administre.subcategory'
      icon={HiOutlineRectangleStack}
      page={page}
      stats={stats}
      actions={subcategoryActions}
      extraColumns={extraColumns}
      filters={filters}
      categoryOptions={options}
    />
  );
};
