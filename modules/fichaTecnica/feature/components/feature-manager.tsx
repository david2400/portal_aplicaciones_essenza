/** @format */

"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  HiOutlineAdjustmentsHorizontal,
  HiOutlineCalendarDays,
} from "react-icons/hi2";
import { CrudManager } from "@/components/crud-manager";
import type { GridColumn } from "@/components/data-grid";
import { formatApiDate, createdWithin } from "@/lib/format";
import { RegisterFeature, UpdateFeature } from "./form";
import type { IFeature } from "../models/feature.interface";
import { deleteFeatureServerAction } from "@/app/[locale]/fichaTecnica/features/actions";

type NamedItem = { id?: number; name?: string };

const toLookup = (items: NamedItem[]) => new Map(items.map((item) => [item.id ?? -1, item.name ?? `#${item.id}`]));

const toOptions = (items: NamedItem[]) =>
  items
    .filter((item) => item.id != null)
    .map((item) => ({ id: String(item.id), value: String(item.id), label: item.name ?? `#${item.id}` }));

interface IFeatureManagerProps {
  initialData: IFeature[];
  units: NamedItem[];
}

/** Características técnicas y su unidad de medida. */
export const FeatureManager = ({ initialData, units }: IFeatureManagerProps) => {
  const t = useTranslations("Administre.feature");
  const tCommon = useTranslations("Administre.common");
  const tCrud = useTranslations("Crud");

  const lookups = useMemo(() => ({ units: toLookup(units) }), [units]);
  const formOptions = useMemo(() => ({ units: toOptions(units) }), [units]);

  const columns = useMemo<GridColumn<IFeature>[]>(
    () => [
      {
        id: "name",
        header: t("fields.name"),
        meta: { label: t("fields.name"), hideable: false, exportValue: (row) => row.name },
        cell: ({ row }) => <span className='font-semibold text-foreground'>{row.original.name ?? "—"}</span>,
      },
      {
        id: "unitId",
        header: t("fields.unitId"),
        meta: { label: t("fields.unitId"), exportValue: (row) => lookups.units.get(row.unitId ?? -1) },
        cell: ({ row }) => lookups.units.get(row.original.unitId ?? -1) ?? "—",
      },
      {
        id: "updatedAt",
        header: tCrud("updatedAt"),
        meta: { label: tCrud("updatedAt"), exportValue: (row) => formatApiDate(row.updatedAt ?? row.createdAt) },
        cell: ({ row }) => (
          <span className='whitespace-nowrap text-muted-foreground'>
            {formatApiDate(row.original.updatedAt ?? row.original.createdAt)}
          </span>
        ),
      },
    ],
    [t, tCommon, tCrud, lookups],
  );

  const now = Date.now();
  const stats = [
    { label: t("total"), value: initialData.length, icon: HiOutlineAdjustmentsHorizontal },
    {
      label: tCrud("recent"),
      value: initialData.filter((item) => createdWithin(item.createdAt, 30, now)).length,
      icon: HiOutlineCalendarDays,
      hint: tCrud("recentHint"),
    },
  ];

  return (
    <CrudManager<IFeature>
      gridId='caracteristicas'
      namespace='Administre.feature'
      icon={HiOutlineAdjustmentsHorizontal}
      eyebrow={tCrud("domains.specs")}
      data={initialData}
      columns={columns}
      stats={stats}
      rowLabel={(row) => row.name ?? `#${row.id}`}
      searchText={(row) => (row.name ?? "")}
      renderForm={(item, close) =>
        item ? (
          <UpdateFeature initialValues={item} handleClose={close} options={formOptions} />
        ) : (
          <RegisterFeature handleClose={close} options={formOptions} />
        )}
      onDelete={(id) => deleteFeatureServerAction(id)}
    />
  );
};
