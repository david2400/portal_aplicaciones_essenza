/** @format */

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import Swal from "sweetalert2";
import { Modal } from "@repo/ui/modals/scenes/dialog/modal";
import { Buttons } from "@repo/ui/buttons/scenes";
import { Badge } from "@repo/ui/badges/scenes/badge";
import {
  HiOutlineTruck,
  HiOutlinePlusCircle,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import { DataTable } from "@/components/data-table";
import { RegisterCarrier, UpdateCarrier } from "./form";
import type { ICarrier } from "../models/carrier.interface";
import { deleteCarrierServerAction } from "@/app/[locale]/logistica/carriers/actions";

const moneyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const formatMoney = (value?: number) => (value == null ? "—" : moneyFormatter.format(value));

interface ICarrierManagerProps {
  initialData: ICarrier[];
}

const rowLabel = (row: ICarrier) => row.name ?? `#${row.id}`;

export const CarrierManager = ({ initialData }: ICarrierManagerProps) => {
  const router = useRouter();
  const t = useTranslations("Administre.carrier");
  const tCommon = useTranslations("Administre.common");

  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState<ICarrier | null>(null);

  const metrics = useMemo(
    () => ({
      total: initialData.length,
      active: initialData.filter((item) => !item.deleted).length,
    }),
    [initialData],
  );

  const handleDelete = (row: ICarrier) => {
    if (row.id == null) return;
    const id = row.id;

    Swal.fire({
      title: tCommon("deleteConfirmTitle"),
      text: tCommon("deleteConfirmText", { name: rowLabel(row) }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: tCommon("deleteConfirmButton"),
      cancelButtonText: tCommon("cancel"),
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      const response = await deleteCarrierServerAction(id);
      if (response.success) {
        Swal.fire({
          title: tCommon("deletedSuccess"),
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        router.refresh();
      } else {
        Swal.fire({
          title: tCommon("errorTitle"),
          text: response.error || tCommon("unexpectedError"),
          icon: "error",
        });
      }
    });
  };

  const columns: ColumnDef<ICarrier>[] = [
    {
      accessorKey: "name",
      header: t("fields.name"),
      cell: ({ row }) => (
        <span className='font-semibold text-foreground'>{row.original.name}</span>
      ),
    },
    {
      accessorKey: "code",
      header: t("fields.code"),
      cell: ({ row }) => row.original.code ?? "—",
    },
    {
      accessorKey: "baseRate",
      header: t("fields.baseRate"),
      cell: ({ row }) => formatMoney(row.original.baseRate),
    },
    {
      accessorKey: "ratePerKm",
      header: t("fields.ratePerKm"),
      cell: ({ row }) => formatMoney(row.original.ratePerKm),
    },
    {
      accessorKey: "maxDeliveryDays",
      header: t("fields.maxDeliveryDays"),
      cell: ({ row }) => row.original.maxDeliveryDays ?? "—",
    },
    {
      accessorKey: "isActive",
      header: t("fields.isActive"),
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "outline"}>
          {row.original.isActive ? tCommon("yes") : tCommon("no")}
        </Badge>
      ),
    },
    {
      id: "status",
      header: tCommon("status"),
      cell: ({ row }) => (
        <Badge variant={row.original.deleted ? "destructive" : "default"}>
          {row.original.deleted ? tCommon("inactive") : tCommon("active")}
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
          <Buttons
            size='sm'
            variant='ghost'
            aria-label={tCommon("deleteAria", { name: rowLabel(row.original) })}
            onClick={() => handleDelete(row.original)}>
            <HiOutlineTrash className='h-4 w-4' aria-hidden='true' />
            {tCommon("delete")}
          </Buttons>
        </div>
      ),
    },
  ];

  const summaryCards = [
    { icon: HiOutlineTruck, label: t("total"), value: metrics.total },
    { icon: HiOutlineCheckCircle, label: tCommon("activeCount"), value: metrics.active },
  ];

  return (
    <section className='flex w-full flex-col gap-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-4'>
          <div className='rounded-2xl bg-primary/10 p-3'>
            <HiOutlineTruck className='h-7 w-7 text-primary' aria-hidden='true' />
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
        <RegisterCarrier
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
        <UpdateCarrier
          initialValues={editing}
          handleClose={() => setEditing(null)}
        />
      </Modal>
    </section>
  );
};
