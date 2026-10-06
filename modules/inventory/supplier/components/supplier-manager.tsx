/** @format */

"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  HiOutlineBuildingOffice2,
  HiOutlineCalendarDays,
} from "react-icons/hi2";
import { CrudManager } from "@/components/crud-manager";
import type { GridColumn } from "@/components/data-grid";
import { formatApiDate, createdWithin } from "@/lib/format";
import { RegisterSupplier, UpdateSupplier } from "./form";
import type { ISupplier } from "../models/supplier.interface";
import { deleteSupplierServerAction } from "@/app/[locale]/inventory/suppliers/actions";

interface ISupplierManagerProps {
  initialData: ISupplier[];
}

/** Proveedores: contacto y datos de abastecimiento. */
export const SupplierManager = ({ initialData }: ISupplierManagerProps) => {
  const t = useTranslations("Administre.supplier");
  const tCommon = useTranslations("Administre.common");
  const tCrud = useTranslations("Crud");

  const columns = useMemo<GridColumn<ISupplier>[]>(
    () => [
      {
        id: "name",
        header: t("fields.name"),
        meta: { label: t("fields.name"), hideable: false, exportValue: (row) => row.name },
        cell: ({ row }) => <span className='font-semibold text-foreground'>{row.original.name ?? "—"}</span>,
      },
      {
        id: "email",
        header: t("fields.email"),
        meta: { label: t("fields.email"), exportValue: (row) => row.email },
        cell: ({ row }) =>
          row.original.email ? (
            <a href={`mailto:${row.original.email}`} className='text-primary underline-offset-4 hover:underline'>
              {row.original.email}
            </a>
          ) : (
            "—"
          ),
      },
      {
        id: "phone",
        header: t("fields.phone"),
        meta: { label: t("fields.phone"), exportValue: (row) => row.phone },
        cell: ({ row }) => row.original.phone || "—",
      },
      {
        id: "address",
        header: t("fields.address"),
        meta: { label: t("fields.address"), exportValue: (row) => row.address },
        cell: ({ row }) => row.original.address || "—",
      },
      {
        id: "updatedAt",
        header: tCrud("updatedAt"),
        meta: { label: tCrud("updatedAt"), exportValue: (row) => formatApiDate(row.updated_at ?? row.created_at) },
        cell: ({ row }) => (
          <span className='whitespace-nowrap text-muted-foreground'>
            {formatApiDate(row.original.updated_at ?? row.original.created_at)}
          </span>
        ),
      },
    ],
    [t, tCommon, tCrud],
  );

  const now = Date.now();
  const stats = [
    { label: t("total"), value: initialData.length, icon: HiOutlineBuildingOffice2 },
    {
      label: tCrud("recent"),
      value: initialData.filter((item) => createdWithin(item.created_at, 30, now)).length,
      icon: HiOutlineCalendarDays,
      hint: tCrud("recentHint"),
    },
  ];

  return (
    <CrudManager<ISupplier>
      gridId='proveedores'
      namespace='Administre.supplier'
      icon={HiOutlineBuildingOffice2}
      eyebrow={tCrud("domains.inventory")}
      data={initialData}
      columns={columns}
      stats={stats}
      rowLabel={(row) => row.name ?? `#${row.id}`}
      searchText={(row) => (row.name ?? "") + " " + (row.email ?? "") + " " + (row.phone ?? "") + " " + (row.address ?? "")}
      renderForm={(item, close) =>
        item ? (
          <UpdateSupplier initialValues={item} handleClose={close} />
        ) : (
          <RegisterSupplier handleClose={close} />
        )}
      onDelete={(id) => deleteSupplierServerAction(id)}
    />
  );
};
