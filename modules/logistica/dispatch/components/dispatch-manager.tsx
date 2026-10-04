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
  HiOutlineEye,
  HiOutlineMapPin,
  HiOutlinePaperAirplane,
  HiOutlinePencilSquare,
  HiOutlinePlusCircle,
  HiOutlineTrash,
  HiOutlineCalendarDays,
} from "react-icons/hi2";
import { DataTable } from "@/components/data-table";
import { Link } from "@/shared/i18n/routing";
import { RegisterDispatch, UpdateDispatch } from "./form";
import { daysFromToday, formatDate } from "../constants";
import type { IDispatch, IDispatchOrder } from "../models/dispatch.interface";
import { deleteDispatchServerAction } from "@/app/[locale]/logistica/dispatches/actions";

interface IDispatchManagerProps {
  initialData: IDispatch[];
  orders: IDispatchOrder[];
}

export const DispatchManager = ({ initialData, orders }: IDispatchManagerProps) => {
  const router = useRouter();
  const t = useTranslations("Administre.dispatch");
  const tCommon = useTranslations("Administre.common");

  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState<IDispatch | null>(null);

  const data = useMemo(() => [...initialData].sort((a, b) => (b.id ?? 0) - (a.id ?? 0)), [initialData]);

  const metrics = useMemo(() => {
    const dueSoon = initialData.filter((item) => {
      const days = daysFromToday(item.estimatedDeliveryDate);
      return days != null && days >= 0 && days <= 7;
    }).length;
    const cities = new Set(
      initialData.map((item) => item.cityDestination?.trim().toLowerCase()).filter(Boolean),
    );
    return { total: initialData.length, dueSoon, cities: cities.size };
  }, [initialData]);

  const handleDelete = (row: IDispatch) => {
    if (row.id == null) return;
    const id = row.id;
    Swal.fire({
      title: tCommon("deleteConfirmTitle"),
      text: tCommon("deleteConfirmText", { name: row.guideNumber ?? `#${id}` }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: tCommon("deleteConfirmButton"),
      cancelButtonText: tCommon("cancel"),
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      const response = await deleteDispatchServerAction(id);
      if (response.success) {
        Swal.fire({ title: tCommon("deletedSuccess"), icon: "success", timer: 2000, showConfirmButton: false });
        router.refresh();
      } else {
        Swal.fire({ title: tCommon("errorTitle"), text: response.error || tCommon("unexpectedError"), icon: "error" });
      }
    });
  };

  const columns: ColumnDef<IDispatch>[] = [
    {
      accessorKey: "guideNumber",
      header: t("fields.guideNumber"),
      cell: ({ row }) => (
        <Link
          href={`/administre/dispatches/${row.original.id}`}
          className='font-semibold text-primary underline-offset-4 hover:underline'>
          {row.original.guideNumber || `#${row.original.id}`}
        </Link>
      ),
    },
    {
      accessorKey: "orderId",
      header: t("fields.orderId"),
      cell: ({ row }) => (row.original.orderId != null ? `#${row.original.orderId}` : "—"),
    },
    {
      id: "route",
      header: t("fields.route"),
      cell: ({ row }) =>
        `${row.original.cityOrigin ?? "—"} → ${row.original.cityDestination ?? "—"}`,
    },
    {
      accessorKey: "estimatedDeliveryDate",
      header: t("fields.estimatedDeliveryDate"),
      cell: ({ row }) => {
        const days = daysFromToday(row.original.estimatedDeliveryDate);
        return (
          <span className='inline-flex items-center gap-2'>
            {formatDate(row.original.estimatedDeliveryDate)}
            {days != null && days >= 0 && days <= 7 ? (
              <Badge variant='secondary'>{t("dueIn", { days })}</Badge>
            ) : null}
          </span>
        );
      },
    },
    {
      accessorKey: "realDeliveryDate",
      header: t("fields.realDeliveryDate"),
      cell: ({ row }) => formatDate(row.original.realDeliveryDate),
    },
    {
      id: "actions",
      header: tCommon("actions"),
      enableSorting: false,
      cell: ({ row }) => {
        const name = row.original.guideNumber ?? `#${row.original.id}`;
        return (
          <div className='flex gap-2'>
            <Link
              href={`/administre/dispatches/${row.original.id}`}
              aria-label={t("viewAria", { name })}
              className='inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium transition-colors hover:bg-accent'>
              <HiOutlineEye className='h-4 w-4' aria-hidden='true' />
              {t("view")}
            </Link>
            <Buttons
              size='sm'
              variant='outline'
              aria-label={tCommon("editAria", { name })}
              onClick={() => setEditing(row.original)}>
              <HiOutlinePencilSquare className='h-4 w-4' aria-hidden='true' />
              {tCommon("edit")}
            </Buttons>
            <Buttons
              size='sm'
              variant='ghost'
              aria-label={tCommon("deleteAria", { name })}
              onClick={() => handleDelete(row.original)}>
              <HiOutlineTrash className='h-4 w-4' aria-hidden='true' />
              {tCommon("delete")}
            </Buttons>
          </div>
        );
      },
    },
  ];

  const summaryCards = [
    { icon: HiOutlinePaperAirplane, label: t("total"), value: metrics.total },
    { icon: HiOutlineCalendarDays, label: t("dueSoonCount"), value: metrics.dueSoon },
    { icon: HiOutlineMapPin, label: t("citiesCount"), value: metrics.cities },
  ];

  return (
    <section className='flex w-full flex-col gap-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-4'>
          <div className='rounded-2xl bg-primary/10 p-3'>
            <HiOutlinePaperAirplane className='h-7 w-7 text-primary' aria-hidden='true' />
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

      <div className='grid gap-4 sm:grid-cols-3'>
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
        data={data}
        columns={columns}
        className='py-2'
        emptyTitle={t("emptyTitle")}
        emptyDescription={t("emptyDescription")}
      />

      <Modal size='lg' title={t("createTitle")} open={openCreate} onOpenChange={setOpenCreate} hideDefaultFooter={true}>
        <RegisterDispatch handleClose={() => setOpenCreate(false)} orders={orders} />
      </Modal>

      <Modal
        size='lg'
        title={t("editTitle")}
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        hideDefaultFooter={true}>
        {editing ? (
          <UpdateDispatch dispatch={editing} orders={orders} handleClose={() => setEditing(null)} />
        ) : null}
      </Modal>
    </section>
  );
};
