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
  HiOutlineArrowLeft,
  HiOutlineMapPin,
  HiOutlinePencilSquare,
  HiOutlinePlusCircle,
  HiOutlineSignal,
  HiOutlineTrash,
} from "react-icons/hi2";
import { DataTable } from "@/components/data-table";
import { Link } from "@/shared/i18n/routing";
import { UpdateDispatch } from "./form";
import { ShippingQuote } from "./shipping-quote";
import { daysFromToday, formatDate, formatDateTime } from "../constants";
import type {
  IDispatch,
  IDispatchCarrier,
  IDispatchLine,
  IDispatchOrder,
  IDispatchOrderLine,
  IDispatchTracking,
} from "../models/dispatch.interface";
import {
  addDispatchLineServerAction,
  addTrackingServerAction,
  deleteDispatchLineServerAction,
  deleteTrackingServerAction,
} from "@/app/[locale]/logistica/dispatches/actions";

interface IDispatchDetailProps {
  dispatch: IDispatch;
  lines: IDispatchLine[];
  trackings: IDispatchTracking[];
  orderLines: IDispatchOrderLine[];
  carriers: IDispatchCarrier[];
  orders: IDispatchOrder[];
}

export const DispatchDetail = ({
  dispatch,
  lines,
  trackings,
  orderLines,
  carriers,
  orders,
}: IDispatchDetailProps) => {
  const router = useRouter();
  const t = useTranslations("Administre.dispatch");
  const tLines = useTranslations("Administre.dispatch.lines");
  const tTracking = useTranslations("Administre.dispatch.tracking");
  const tCommon = useTranslations("Administre.common");

  const [editing, setEditing] = useState(false);
  const dispatchId = dispatch.id ?? 0;

  const orderLineMap = useMemo(
    () => new Map(orderLines.map((line) => [line.id ?? -1, line])),
    [orderLines],
  );

  const pendingLines = useMemo(() => {
    const included = new Set(lines.map((line) => line.productOrderId));
    return orderLines.filter((line) => line.id != null && !included.has(line.id));
  }, [lines, orderLines]);

  const sortedTrackings = useMemo(
    () => [...trackings].sort((a, b) => (b.id ?? 0) - (a.id ?? 0)),
    [trackings],
  );

  const showError = (message?: string) =>
    Swal.fire({ title: tCommon("errorTitle"), text: message || tCommon("unexpectedError"), icon: "error" });

  const run = async (action: () => Promise<{ success: boolean; error?: string }>) => {
    const response = await action();
    if (response.success) router.refresh();
    else showError(response.error);
  };

  const handleAddLine = async () => {
    const result = await Swal.fire({
      title: tLines("create"),
      input: "select",
      inputOptions: Object.fromEntries(
        pendingLines.map((line) => [String(line.id), `${line.productName} × ${line.quantity}`]),
      ),
      inputPlaceholder: tCommon("selectPlaceholder"),
      showCancelButton: true,
      confirmButtonText: tCommon("save"),
      cancelButtonText: tCommon("cancel"),
      inputValidator: (value) => (!value ? tLines("selectRequired") : undefined),
    });
    if (result.isConfirmed && result.value) {
      await run(() => addDispatchLineServerAction(dispatchId, Number(result.value)));
    }
  };

  const handleAddAll = () =>
    run(async () => {
      for (const line of pendingLines) {
        const response = await addDispatchLineServerAction(dispatchId, line.id as number);
        if (!response.success) return response;
      }
      return { success: true };
    });

  const confirmDelete = (name: string, action: () => Promise<{ success: boolean; error?: string }>) =>
    Swal.fire({
      title: tCommon("deleteConfirmTitle"),
      text: tCommon("deleteConfirmText", { name }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: tCommon("deleteConfirmButton"),
      cancelButtonText: tCommon("cancel"),
    }).then((result) => (result.isConfirmed ? run(action) : undefined));

  const lineColumns: ColumnDef<IDispatchLine>[] = [
    {
      accessorKey: "productOrderId",
      header: tLines("fields.product"),
      cell: ({ row }) => (
        <span className='font-semibold text-foreground'>
          {orderLineMap.get(row.original.productOrderId ?? -1)?.productName ??
            `#${row.original.productOrderId}`}
        </span>
      ),
    },
    {
      id: "quantity",
      header: tLines("fields.quantity"),
      cell: ({ row }) => orderLineMap.get(row.original.productOrderId ?? -1)?.quantity ?? "—",
    },
    {
      id: "actions",
      header: tCommon("actions"),
      enableSorting: false,
      cell: ({ row }) => {
        const name =
          orderLineMap.get(row.original.productOrderId ?? -1)?.productName ?? `#${row.original.id}`;
        return (
          <Buttons
            size='sm'
            variant='ghost'
            aria-label={tCommon("deleteAria", { name })}
            onClick={() =>
              row.original.id != null &&
              confirmDelete(name, () => deleteDispatchLineServerAction(row.original.id as number))
            }>
            <HiOutlineTrash className='h-4 w-4' aria-hidden='true' />
            {tLines("remove")}
          </Buttons>
        );
      },
    },
  ];

  const days = daysFromToday(dispatch.estimatedDeliveryDate);

  const summary = [
    {
      label: t("fields.orderId"),
      value:
        dispatch.orderId != null ? (
          <Link
            href={`/administre/orders/${dispatch.orderId}`}
            className='text-primary underline-offset-4 hover:underline'>
            #{dispatch.orderId}
          </Link>
        ) : (
          "—"
        ),
    },
    { label: t("fields.estimatedDeliveryDate"), value: formatDate(dispatch.estimatedDeliveryDate) },
    { label: t("fields.realDeliveryDate"), value: formatDate(dispatch.realDeliveryDate) },
    {
      label: t("countdown"),
      value: days == null ? "—" : days >= 0 ? t("dueIn", { days }) : t("overdue", { days: -days }),
    },
  ];

  return (
    <section className='flex w-full flex-col gap-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='space-y-2'>
          <Link
            href='/administre/dispatches'
            className='inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground'>
            <HiOutlineArrowLeft className='h-4 w-4' aria-hidden='true' />
            {t("backToList")}
          </Link>
          <h2 className='text-xl font-semibold tracking-tight text-foreground'>
            {t("dispatchLabel", { guide: dispatch.guideNumber || `#${dispatch.id}` })}
          </h2>
        </div>
        <Buttons variant='outline' onClick={() => setEditing(true)}>
          <HiOutlinePencilSquare className='h-4 w-4' aria-hidden='true' />
          {t("editTitle")}
        </Buttons>
      </div>

      <dl className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {summary.map((entry) => (
          <div key={entry.label} className='rounded-2xl border border-border bg-card p-5 shadow-sm'>
            <dt className='text-sm font-semibold text-muted-foreground'>{entry.label}</dt>
            <dd className='mt-2 text-xl font-semibold text-foreground'>{entry.value}</dd>
          </div>
        ))}
      </dl>

      <div className='grid gap-4 lg:grid-cols-2'>
        <div className='rounded-2xl border border-border bg-card p-5 shadow-sm'>
          <h3 className='inline-flex items-center gap-2 text-base font-semibold text-foreground'>
            <HiOutlineMapPin className='h-5 w-5 text-primary' aria-hidden='true' />
            {t("routeTitle")}
          </h3>
          <dl className='mt-4 grid gap-4 text-sm sm:grid-cols-2'>
            <div>
              <dt className='text-muted-foreground'>{t("originLegend")}</dt>
              <dd className='font-medium text-foreground'>
                {dispatch.cityOrigin ?? "—"}, {dispatch.departmentOrigin ?? "—"}
              </dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>{t("destinationLegend")}</dt>
              <dd className='font-medium text-foreground'>
                {dispatch.cityDestination ?? "—"}, {dispatch.departmentDestination ?? "—"}
              </dd>
            </div>
            <div className='sm:col-span-2'>
              <dt className='text-muted-foreground'>{t("fields.address")}</dt>
              <dd className='font-medium text-foreground'>{dispatch.address || "—"}</dd>
            </div>
          </dl>
        </div>

        <div className='rounded-2xl border border-border bg-card p-5 shadow-sm'>
          <div className='flex items-center justify-between gap-2'>
            <h3 className='inline-flex items-center gap-2 text-base font-semibold text-foreground'>
              <HiOutlineSignal className='h-5 w-5 text-primary' aria-hidden='true' />
              {tTracking("title")}
            </h3>
            <Buttons size='sm' variant='outline' onClick={() => run(() => addTrackingServerAction(dispatchId))}>
              <HiOutlinePlusCircle className='h-4 w-4' aria-hidden='true' />
              {tTracking("create")}
            </Buttons>
          </div>
          <p className='mt-1 text-xs text-muted-foreground'>{tTracking("hint")}</p>
          {sortedTrackings.length === 0 ? (
            <p className='mt-4 text-sm text-muted-foreground'>{tTracking("empty")}</p>
          ) : (
            <ol className='mt-4 space-y-2 border-l border-border pl-4'>
              {sortedTrackings.map((tracking) => (
                <li key={tracking.id} className='flex items-center justify-between gap-2 text-sm'>
                  <span>
                    <span className='font-medium text-foreground'>
                      {tTracking("eventLabel", { id: tracking.id ?? "—" })}
                    </span>{" "}
                    <span className='text-muted-foreground'>· {formatDateTime(tracking.createdAt)}</span>
                  </span>
                  <Buttons
                    size='sm'
                    variant='ghost'
                    aria-label={tCommon("deleteAria", { name: tTracking("eventLabel", { id: tracking.id ?? "—" }) })}
                    onClick={() =>
                      tracking.id != null &&
                      confirmDelete(tTracking("eventLabel", { id: tracking.id }), () =>
                        deleteTrackingServerAction(tracking.id as number),
                      )
                    }>
                    <HiOutlineTrash className='h-4 w-4' aria-hidden='true' />
                  </Buttons>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className='grid gap-4 lg:grid-cols-3'>
        <div className='space-y-3 lg:col-span-2'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <h3 className='text-base font-semibold text-foreground'>{tLines("title")}</h3>
              <p className='text-sm text-muted-foreground'>
                {tLines("progress", { included: lines.length, total: orderLines.length })}
              </p>
            </div>
            <div className='flex flex-wrap gap-2'>
              <Buttons size='sm' variant='outline' disabled={pendingLines.length === 0} onClick={handleAddAll}>
                {tLines("addAll")}
              </Buttons>
              <Buttons size='sm' disabled={pendingLines.length === 0} onClick={handleAddLine}>
                <HiOutlinePlusCircle className='h-4 w-4' aria-hidden='true' />
                {tLines("create")}
              </Buttons>
            </div>
          </div>
          <DataTable
            data={lines}
            columns={lineColumns}
            emptyTitle={tLines("emptyTitle")}
            emptyDescription={tLines("emptyDescription")}
          />
        </div>

        <ShippingQuote carriers={carriers} />
      </div>

      <Modal size='lg' title={t("editTitle")} open={editing} onOpenChange={setEditing} hideDefaultFooter={true}>
        {editing ? (
          <UpdateDispatch dispatch={dispatch} orders={orders} handleClose={() => setEditing(false)} />
        ) : null}
      </Modal>
    </section>
  );
};
