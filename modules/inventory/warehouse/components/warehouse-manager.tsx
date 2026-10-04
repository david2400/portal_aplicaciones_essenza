/** @format */

"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { Modal } from "@repo/ui/modals/scenes/dialog/modal";
import { Buttons } from "@repo/ui/buttons/scenes";
import { Badge } from "@repo/ui/badges/scenes/badge";
import {
  HiOutlineBuildingStorefront,
  HiOutlinePlusCircle,
  HiOutlinePencilSquare,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import { DataTable } from "@/components/data-table";
import { RegisterWarehouse, UpdateWarehouse } from "./form";
import type { IWarehouse } from "../models/warehouse.interface";
// El backend no expone DELETE para bodegas: no hay acción de borrado.

interface IWarehouseManagerProps {
  initialData: IWarehouse[];
}

const rowLabel = (row: IWarehouse) => row.name ?? `#${row.id}`;

export const WarehouseManager = ({ initialData }: IWarehouseManagerProps) => {
  const t = useTranslations("Administre.warehouse");
  const tCommon = useTranslations("Administre.common");

  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState<IWarehouse | null>(null);

  const metrics = useMemo(
    () => ({
      total: initialData.length,
      active: initialData.filter((item) => item.active !== false).length,
    }),
    [initialData],
  );


  const columns: ColumnDef<IWarehouse>[] = [
    {
      accessorKey: "code",
      header: t("fields.code"),
      cell: ({ row }) => (
        <span className='font-semibold text-foreground'>{row.original.code}</span>
      ),
    },
    {
      accessorKey: "name",
      header: t("fields.name"),
      cell: ({ row }) => row.original.name ?? "—",
    },
    {
      accessorKey: "address",
      header: t("fields.address"),
      cell: ({ row }) => row.original.address ?? "—",
    },
    {
      id: "status",
      header: tCommon("status"),
      cell: ({ row }) => (
        <Badge variant={row.original.active === false ? "destructive" : "default"}>
          {row.original.active === false ? tCommon("inactive") : tCommon("active")}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: tCommon("actions"),
      enableSorting: false,
      cell: ({ row }) => (
        <div className='flex gap-2'>
          <Buttons
            size='sm'
            variant='outline'
            aria-label={tCommon("editAria", { name: rowLabel(row.original) })}
            onClick={() => setEditing(row.original)}>
            <HiOutlinePencilSquare className='h-4 w-4' aria-hidden='true' />
            {tCommon("edit")}
          </Buttons>
        </div>
      ),
    },
  ];

  const summaryCards = [
    { icon: HiOutlineBuildingStorefront, label: t("total"), value: metrics.total },
    { icon: HiOutlineCheckCircle, label: tCommon("activeCount"), value: metrics.active },
  ];

  return (
    <section className='flex w-full flex-col gap-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-4'>
          <div className='rounded-2xl bg-primary/10 p-3'>
            <HiOutlineBuildingStorefront className='h-7 w-7 text-primary' aria-hidden='true' />
          </div>
          <div>
            <h2 className='text-xl font-semibold tracking-tight text-foreground'>{t("title")}</h2>
            <p className='mt-1.5 text-base text-muted-foreground'>{t("description")}</p>
          </div>
        </div>
        <Buttons
          className='inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-sm'
          onClick={() => setOpenCreate(true)}>
          <HiOutlinePlusCircle className='h-4 w-4' aria-hidden='true' />
          {t("create")}
        </Buttons>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className='rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md'>
            <div className='flex items-center justify-between text-sm font-semibold text-muted-foreground'>
              <span>{card.label}</span>
              <card.icon className='h-5 w-5 text-primary' aria-hidden='true' />
            </div>
            <p className='mt-2 text-2xl font-semibold text-foreground'>{card.value}</p>
          </div>
        ))}
      </div>

      <DataTable
        data={initialData}
        columns={columns}
        className='py-2'
        emptyTitle={t("emptyTitle")}
        emptyDescription={t("emptyDescription")}
      />

      <Modal
        size='lg'
        title={t("createTitle")}
        open={openCreate}
        onOpenChange={setOpenCreate}
        hideDefaultFooter={true}>
        <RegisterWarehouse
          handleClose={() => setOpenCreate(false)}
        />
      </Modal>

      <Modal
        size='lg'
        title={t("editTitle")}
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        hideDefaultFooter={true}>
        <UpdateWarehouse
          initialValues={editing}
          handleClose={() => setEditing(null)}
        />
      </Modal>
    </section>
  );
};
