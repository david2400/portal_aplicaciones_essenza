/** @format */

"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  HiOutlineCalendarDays,
  HiOutlineSwatch,
} from "react-icons/hi2";
import { CrudManager } from "@/components/crud-manager";
import type { GridColumn } from "@/components/data-grid";
import { formatApiDate, createdWithin } from "@/lib/format";
import { RegisterTypeProduct, UpdateTypeProduct } from "./form";
import type { ITypeProduct } from "../models/typeProduct.interface";
import { deleteTypeProductServerAction } from "@/app/[locale]/fichaTecnica/type-products/actions";

interface ITypeProductManagerProps {
  initialData: ITypeProduct[];
}

/** Tipos de producto (agrupan características). */
export const TypeProductManager = ({ initialData }: ITypeProductManagerProps) => {
  const t = useTranslations("Administre.typeProduct");
  const tCommon = useTranslations("Administre.common");
  const tCrud = useTranslations("Crud");

  const columns = useMemo<GridColumn<ITypeProduct>[]>(
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
    { label: t("total"), value: initialData.length, icon: HiOutlineSwatch },
    {
      label: tCrud("recent"),
      value: initialData.filter((item) => createdWithin(item.createdAt, 30, now)).length,
      icon: HiOutlineCalendarDays,
      hint: tCrud("recentHint"),
    },
  ];

  return (
    <CrudManager<ITypeProduct>
      gridId='tipos-producto'
      namespace='Administre.typeProduct'
      icon={HiOutlineSwatch}
      eyebrow={tCrud("domains.specs")}
      data={initialData}
      columns={columns}
      stats={stats}
      rowLabel={(row) => row.name ?? `#${row.id}`}
      searchText={(row) => (row.name ?? "")}
      renderForm={(item, close) =>
        item ? (
          <UpdateTypeProduct initialValues={item} handleClose={close} />
        ) : (
          <RegisterTypeProduct handleClose={close} />
        )}
      onDelete={(id) => deleteTypeProductServerAction(id)}
    />
  );
};
