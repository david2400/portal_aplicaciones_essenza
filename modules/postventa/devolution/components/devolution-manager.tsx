/** @format */

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import Swal from "sweetalert2";
import { Modal } from "@repo/ui/modals/scenes/dialog/modal";
import { Buttons } from "@repo/ui/buttons/scenes";
import {
  HiOutlineArrowUturnLeft,
  HiOutlineBanknotes,
  HiOutlineClock,
  HiOutlineArrowPath,
  HiOutlineEye,
  HiOutlinePencilSquare,
  HiOutlinePlusCircle,
  HiOutlineTrash,
} from "react-icons/hi2";
import { DataTable } from "@/components/data-table";
import { Link } from "@/shared/i18n/routing";
import { RegisterDevolution, UpdateDevolution } from "./form";
import { DevolutionStatusBadge } from "./devolution-status-badge";
import { DEVOLUTION_STATES, formatMoney, type DevolutionState } from "../constants";
import type { IDevolution, IDevolutionCatalogs } from "../models/devolution.interface";
import { deleteDevolutionServerAction } from "@/app/[locale]/postventa/devolutions/actions";

interface IDevolutionManagerProps {
  initialData: IDevolution[];
  catalogs: IDevolutionCatalogs;
}

const IN_PROGRESS: DevolutionState[] = ["A", "R", "I"];

export const DevolutionManager = ({ initialData, catalogs }: IDevolutionManagerProps) => {
  const router = useRouter();
  const t = useTranslations("Administre.devolution");
  const tStates = useTranslations("Administre.devolution.states");
  const tCommon = useTranslations("Administre.common");

  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState<IDevolution | null>(null);
  const [stateFilter, setStateFilter] = useState<DevolutionState | "ALL">("ALL");

  const motiveNames = useMemo(
    () => new Map(catalogs.motives.map((item) => [item.id ?? -1, item.name ?? `#${item.id}`])),
    [catalogs.motives],
  );

  const data = useMemo(
    () =>
      [...initialData]
        .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
        .filter((item) => stateFilter === "ALL" || (item.state ?? "P") === stateFilter),
    [initialData, stateFilter],
  );

  const metrics = useMemo(
    () => ({
      total: initialData.length,
      pending: initialData.filter((item) => (item.state ?? "P") === "P").length,
      inProgress: initialData.filter((item) => IN_PROGRESS.includes(item.state as DevolutionState))
        .length,
      refunded: initialData
        .filter((item) => item.state === "F")
        .reduce((acc, item) => acc + (item.totalRefundAmount ?? 0), 0),
    }),
    [initialData],
  );

  const handleDelete = (row: IDevolution) => {
    if (row.id == null) return;
    const id = row.id;

    Swal.fire({
      title: tCommon("deleteConfirmTitle"),
      text: tCommon("deleteConfirmText", { name: t("devolutionLabel", { id }) }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: tCommon("deleteConfirmButton"),
      cancelButtonText: tCommon("cancel"),
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      const response = await deleteDevolutionServerAction(id);
      if (response.success) {
        Swal.fire({ title: tCommon("deletedSuccess"), icon: "success", timer: 2000, showConfirmButton: false });
        router.refresh();
      } else {
        Swal.fire({ title: tCommon("errorTitle"), text: response.error || tCommon("unexpectedError"), icon: "error" });
      }
    });
  };

  const columns: ColumnDef<IDevolution>[] = [
    {
      accessorKey: "id",
      header: t("fields.id"),
      cell: ({ row }) => (
        <Link
          href={`/administre/devolutions/${row.original.id}`}
          className='font-semibold text-primary underline-offset-4 hover:underline'>
          {t("devolutionLabel", { id: row.original.id ?? "—" })}
        </Link>
      ),
    },
    {
      accessorKey: "orderId",
      header: t("fields.orderId"),
      cell: ({ row }) => (row.original.orderId != null ? `#${row.original.orderId}` : "—"),
    },
    {
      accessorKey: "motiveDevolutionId",
      header: t("fields.motiveDevolutionId"),
      cell: ({ row }) => motiveNames.get(row.original.motiveDevolutionId ?? -1) ?? "—",
    },
    {
      accessorKey: "state",
      header: t("fields.state"),
      cell: ({ row }) => <DevolutionStatusBadge state={row.original.state} />,
    },
    {
      accessorKey: "totalRefundAmount",
      header: t("fields.totalRefundAmount"),
      cell: ({ row }) => formatMoney(row.original.totalRefundAmount),
    },
    {
      id: "actions",
      header: tCommon("actions"),
      enableSorting: false,
      cell: ({ row }) => {
        const name = t("devolutionLabel", { id: row.original.id ?? "—" });
        return (
          <div className='flex gap-2'>
            <Link
              href={`/administre/devolutions/${row.original.id}`}
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
    { icon: HiOutlineArrowUturnLeft, label: t("total"), value: metrics.total },
    { icon: HiOutlineClock, label: t("pendingCount"), value: metrics.pending },
    { icon: HiOutlineArrowPath, label: t("inProgressCount"), value: metrics.inProgress },
    { icon: HiOutlineBanknotes, label: t("refundedTotal"), value: formatMoney(metrics.refunded) },
  ];

  const filters: Array<DevolutionState | "ALL"> = ["ALL", ...DEVOLUTION_STATES];

  return (
    <section className='flex w-full flex-col gap-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-4'>
          <div className='rounded-2xl bg-primary/10 p-3'>
            <HiOutlineArrowUturnLeft className='h-7 w-7 text-primary' aria-hidden='true' />
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

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
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

      <div role='group' aria-label={t("filterLabel")} className='flex flex-wrap gap-2'>
        {filters.map((value) => (
          <Buttons
            key={value}
            size='sm'
            variant={stateFilter === value ? "default" : "outline"}
            aria-pressed={stateFilter === value}
            onClick={() => setStateFilter(value)}>
            {value === "ALL" ? t("allStates") : tStates(value)}
          </Buttons>
        ))}
      </div>

      <DataTable
        data={data}
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
        <RegisterDevolution handleClose={() => setOpenCreate(false)} catalogs={catalogs} />
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
          <UpdateDevolution
            devolution={editing}
            catalogs={catalogs}
            handleClose={() => setEditing(null)}
          />
        ) : null}
      </Modal>
    </section>
  );
};
