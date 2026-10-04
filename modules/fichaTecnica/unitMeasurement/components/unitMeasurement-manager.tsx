/** @format */

"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  HiOutlineCalendarDays,
  HiOutlineScale,
} from "react-icons/hi2";
import { CrudManager } from "@/components/crud-manager";
import type { GridColumn } from "@/components/data-grid";
import { formatApiDate, createdWithin } from "@/lib/format";
import { RegisterUnitMeasurement, UpdateUnitMeasurement } from "./form";
import type { IUnitMeasurement } from "../models/unitMeasurement.interface";
import { deleteUnitMeasurementServerAction } from "@/app/[locale]/fichaTecnica/unit-measurements/actions";

interface IUnitMeasurementManagerProps {
  initialData: IUnitMeasurement[];
}

/** Unidades de medida de las características. */
export const UnitMeasurementManager = ({ initialData }: IUnitMeasurementManagerProps) => {
  const t = useTranslations("Administre.unitMeasurement");
  const tCommon = useTranslations("Administre.common");
  const tCrud = useTranslations("Crud");

  const columns = useMemo<GridColumn<IUnitMeasurement>[]>(
    () => [
      {
        id: "name",
        header: t("fields.name"),
        meta: { label: t("fields.name"), hideable: false, exportValue: (row) => row.name },
        cell: ({ row }) => <span className='font-semibold text-foreground'>{row.original.name ?? "—"}</span>,
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
    [t, tCommon, tCrud],
  );

  const now = Date.now();
  const stats = [
    { label: t("total"), value: initialData.length, icon: HiOutlineScale },
    {
      label: tCrud("recent"),
      value: initialData.filter((item) => createdWithin(item.createdAt, 30, now)).length,
      icon: HiOutlineCalendarDays,
      hint: tCrud("recentHint"),
    },
  ];

  return (
    <CrudManager<IUnitMeasurement>
      gridId='unidades-medida'
      namespace='Administre.unitMeasurement'
      icon={HiOutlineScale}
      eyebrow={tCrud("domains.specs")}
      data={initialData}
      columns={columns}
      stats={stats}
      rowLabel={(row) => row.name ?? `#${row.id}`}
      searchText={(row) => (row.name ?? "")}
      renderForm={(item, close) =>
        item ? (
          <UpdateUnitMeasurement initialValues={item} handleClose={close} />
        ) : (
          <RegisterUnitMeasurement handleClose={close} />
        )}
      onDelete={(id) => deleteUnitMeasurementServerAction(id)}
    />
  );
};
