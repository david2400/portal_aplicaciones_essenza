/** @format */

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { confirm, notify } from "@/components/notifications";
import { Modal } from "@repo/ui/modals/scenes/dialog/modal";
import { Buttons } from "@repo/ui/buttons/scenes";
import { Badge } from "@repo/ui/badges/scenes/badge";
import {
  HiOutlineArchiveBoxArrowDown,
  HiOutlineArrowLeft,
  HiOutlineArrowUturnLeft,
  HiOutlineBanknotes,
  HiOutlineCheckCircle,
  HiOutlineClipboardDocumentCheck,
  HiOutlineDocumentText,
  HiOutlineLink,
  HiOutlinePencilSquare,
  HiOutlinePlusCircle,
  HiOutlineReceiptRefund,
  HiOutlineTrash,
  HiOutlineXCircle,
} from "react-icons/hi2";
import type { IconType } from "react-icons";
import { DataGrid, type GridColumn, type RowAction } from "@/components/data-grid";
import { StatCards } from "@/components/stat-cards";
import { Link } from "@/shared/i18n/routing";
import { DevolutionDetailForm, EvidenceForm, UpdateDevolution } from "./form";
import { DevolutionStatusBadge } from "./devolution-status-badge";
import { ReturnActionDialog, type FlowDialog } from "./return-action-dialogs";
import { formatDateTime, formatMoney, isDevolutionState, type DevolutionState } from "../constants";
import type {
  IDevolution,
  IDevolutionCatalogs,
  IDevolutionDetail,
  IDevolutionEvidence,
  IDevolutionOption,
  IReturnCreditNote,
  IReturnableOrder,
  ReturnAction,
} from "../models/devolution.interface";
import {
  deleteDevolutionDetailServerAction,
  deleteDevolutionEvidenceServerAction,
} from "@/app/[locale]/postventa/devolutions/actions";

interface IDevolutionDetailProps {
  devolution: IDevolution;
  evidences: IDevolutionEvidence[];
  catalogs: IDevolutionCatalogs;
  /** Lo que se puede devolver de la orden sin contar esta devolución (y lo reembolsable). */
  returnable: IReturnableOrder | null;
  warehouses: IDevolutionOption[];
  creditNotes: IReturnCreditNote[];
}

const TIMELINE: DevolutionState[] = ["P", "A", "R", "I", "F"];

const ACTION_BUTTONS: { action: Exclude<ReturnAction, "edit_lines">; code: DevolutionState; icon: IconType }[] = [
  { action: "approve", code: "A", icon: HiOutlineCheckCircle },
  { action: "receive", code: "R", icon: HiOutlineArchiveBoxArrowDown },
  { action: "inspect", code: "I", icon: HiOutlineClipboardDocumentCheck },
  { action: "refund", code: "F", icon: HiOutlineBanknotes },
];

/**
 * Detalle de una devolución con su flujo: las acciones disponibles vienen del backend
 * (`actions`); la inspección reingresa al stock y el reembolso devuelve el dinero sobre los
 * pagos de la orden y emite la nota crédito parcial.
 */
export const DevolutionDetail = ({
  devolution,
  evidences,
  catalogs,
  returnable,
  warehouses,
  creditNotes,
}: IDevolutionDetailProps) => {
  const router = useRouter();
  const t = useTranslations("Administre.devolution");
  const tf = useTranslations("Administre.devolution.flow");
  const tStates = useTranslations("Administre.devolution.states");
  const tDetails = useTranslations("Administre.devolution.details");
  const tEvidences = useTranslations("Administre.devolution.evidences");
  const tCommon = useTranslations("Administre.common");

  const [editing, setEditing] = useState(false);
  const [dialog, setDialog] = useState<FlowDialog>(null);
  const [detailModal, setDetailModal] = useState<{ open: boolean; detail: IDevolutionDetail | null }>({
    open: false,
    detail: null,
  });
  const [evidenceOpen, setEvidenceOpen] = useState(false);

  const state: DevolutionState = isDevolutionState(devolution.state) ? devolution.state : "P";
  const actions = (devolution.actions ?? []) as ReturnAction[];
  const canEditLines = actions.includes("edit_lines");
  const canEditHeader = state === "P" || state === "A";
  const details = devolution.details ?? [];
  const devolutionId = devolution.id ?? 0;

  const names = useMemo(() => {
    const toMap = (items: IDevolutionOption[]) => new Map(items.map((item) => [item.id ?? -1, item.name ?? `#${item.id}`]));
    return {
      motives: toMap(catalogs.motives),
      returnMethods: toMap(catalogs.returnMethods),
      refundMethods: toMap(catalogs.refundMethods),
      warehouses: toMap(warehouses),
    };
  }, [catalogs, warehouses]);

  const units = details.reduce((sum, detail) => sum + (detail.received_quantity ?? detail.quantity ?? 0), 0);
  const restocked = details.reduce((sum, detail) => sum + (detail.restocked_quantity ?? 0), 0);
  const estimated = details.reduce((sum, detail) => sum + (detail.quantity ?? 0) * (detail.unit_price ?? 0), 0);

  const showError = (message?: string) => notify.error(tCommon("errorTitle"), message || tCommon("unexpectedError"));

  const confirmDelete = (name: string, action: () => Promise<{ success: boolean; error?: string }>) =>
    confirm({
      title: tCommon("deleteConfirmTitle"),
      description: tCommon("deleteConfirmText", { name }),
      confirmLabel: tCommon("deleteConfirmButton"),
      tone: "danger",
    }).then(async (ok) => {
      if (!ok) return;
      const response = await action();
      if (response.success) {
        notify.success(tCommon("deletedSuccess"), name);
        router.refresh();
      } else showError(response.error);
    });

  const detailColumns: GridColumn<IDevolutionDetail>[] = [
    {
      id: "product",
      header: tDetails("fields.productOrderId"),
      meta: { label: tDetails("fields.productOrderId"), hideable: false, exportValue: (row) => row.product_name },
      cell: ({ row }) => (
        <div className='min-w-0'>
          <p className='font-semibold text-foreground'>{row.original.product_name ?? `#${row.original.product_order_id}`}</p>
          <p className='font-mono text-xs text-muted-foreground'>{row.original.sku_code ?? "—"}</p>
          {row.original.observation && row.original.observation !== "-" ? (
            <p className='mt-0.5 text-xs text-muted-foreground'>{row.original.observation}</p>
          ) : null}
        </div>
      ),
    },
    {
      id: "quantity",
      header: tDetails("fields.quantity"),
      meta: { label: tDetails("fields.quantity"), align: "right", exportValue: (row) => row.quantity },
      cell: ({ row }) => <span className='tabular-nums'>{row.original.quantity ?? "—"}</span>,
    },
    {
      id: "received",
      header: tDetails("fields.receivedQuantity"),
      meta: { label: tDetails("fields.receivedQuantity"), align: "right", exportValue: (row) => row.received_quantity },
      cell: ({ row }) => <span className='tabular-nums'>{row.original.received_quantity ?? "—"}</span>,
    },
    {
      id: "condition",
      header: tDetails("fields.condition"),
      meta: { label: tDetails("fields.condition"), exportValue: (row) => row.condition },
      cell: ({ row }) =>
        row.original.condition ? (
          <div className='space-y-1'>
            <span>{tDetails(`conditions.${row.original.condition}` as never)}</span>
            {row.original.restock ? (
              <Badge variant='secondary'>{tf("restocked", { count: row.original.restocked_quantity ?? 0 })}</Badge>
            ) : (
              <Badge variant='outline'>{tf("notRestocked")}</Badge>
            )}
          </div>
        ) : (
          "—"
        ),
    },
    {
      id: "unitPrice",
      header: tDetails("fields.unitPrice"),
      meta: { label: tDetails("fields.unitPrice"), align: "right", exportValue: (row) => row.unit_price },
      cell: ({ row }) => <span className='tabular-nums'>{formatMoney(row.original.unit_price)}</span>,
    },
    {
      id: "fee",
      header: tDetails("fields.restockingFee"),
      meta: { label: tDetails("fields.restockingFee"), align: "right", exportValue: (row) => row.restocking_fee },
      cell: ({ row }) => <span className='tabular-nums'>{formatMoney(row.original.restocking_fee)}</span>,
    },
    {
      id: "refund",
      header: tDetails("fields.refundAmount"),
      meta: { label: tDetails("fields.refundAmount"), align: "right", exportValue: (row) => row.refund_amount },
      cell: ({ row }) => <span className='font-medium tabular-nums'>{formatMoney(row.original.refund_amount)}</span>,
    },
  ];

  const detailRowActions = (detail: IDevolutionDetail): RowAction[] => {
    if (!canEditLines) return [];
    const name = detail.product_name ?? `#${detail.id}`;
    return [
      { label: tCommon("edit"), icon: HiOutlinePencilSquare, onSelect: () => setDetailModal({ open: true, detail }) },
      {
        label: tCommon("delete"),
        icon: HiOutlineTrash,
        tone: "danger",
        separated: true,
        disabled: detail.id == null || details.length <= 1,
        onSelect: () => void confirmDelete(name, () => deleteDevolutionDetailServerAction(detail.id as number)),
      },
    ];
  };

  const summary = [
    {
      label: t("fields.orderId"),
      value:
        devolution.order_id != null ? (
          <Link href={`/ventas/orders/${devolution.order_id}`} className='text-primary underline-offset-4 hover:underline'>
            #{devolution.order_id}
          </Link>
        ) : (
          "—"
        ),
      icon: HiOutlineArrowUturnLeft,
    },
    {
      label: tf("units"),
      value: String(units),
      hint: state === "I" || state === "F" ? tf("unitsRestocked", { count: restocked }) : undefined,
      icon: HiOutlineArchiveBoxArrowDown,
    },
    {
      label: t("fields.totalRefundAmount"),
      value: devolution.total_refund_amount != null ? formatMoney(devolution.total_refund_amount) : "—",
      hint: devolution.total_refund_amount == null ? tf("estimatedValue", { amount: formatMoney(estimated) }) : undefined,
      icon: HiOutlineReceiptRefund,
    },
    {
      label: tf("refunded"),
      value: state === "F" ? formatMoney(devolution.refunded_amount) : "—",
      hint:
        state === "F" && (devolution.total_refund_amount ?? 0) > (devolution.refunded_amount ?? 0)
          ? tf("storeCreditShort", {
              amount: formatMoney((devolution.total_refund_amount ?? 0) - (devolution.refunded_amount ?? 0)),
            })
          : undefined,
      icon: HiOutlineBanknotes,
    },
  ];

  const who = (by?: string, at?: string) => (at ? `${by || "—"} · ${formatDateTime(at)}` : undefined);
  const timelineInfo: Partial<Record<DevolutionState, string | undefined>> = {
    P: devolution.created_at ? formatDateTime(devolution.created_at) : undefined,
    A: who(devolution.approved_by, devolution.approved_at),
    R: who(devolution.received_by, devolution.received_at),
    I: who(devolution.inspected_by, devolution.inspected_at),
    F: who(devolution.refunded_by, devolution.refunded_at),
  };
  const reachedIndex = TIMELINE.indexOf(state);

  return (
    <section className='flex w-full flex-col gap-6'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
        <div className='space-y-2'>
          <Link
            href='/postventa/devolutions'
            className='inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground'>
            <HiOutlineArrowLeft className='h-4 w-4' aria-hidden='true' />
            {t("backToList")}
          </Link>
          <div className='flex flex-wrap items-center gap-3'>
            <h2 className='text-xl font-semibold tracking-tight text-foreground'>
              {t("devolutionLabel", { id: devolution.id ?? "—" })}
            </h2>
            <DevolutionStatusBadge state={devolution.state} />
          </div>
        </div>
        <div className='flex flex-wrap gap-2'>
          {canEditHeader ? (
            <Buttons variant='outline' onClick={() => setEditing(true)} className='rounded-full'>
              <HiOutlinePencilSquare className='h-4 w-4' aria-hidden='true' />
              {t("editTitle")}
            </Buttons>
          ) : null}
          {actions.includes("reject") ? (
            <Buttons variant='danger' onClick={() => setDialog("reject")} className='rounded-full'>
              <HiOutlineXCircle className='h-4 w-4' aria-hidden='true' />
              {t("actions.X")}
            </Buttons>
          ) : null}
          {ACTION_BUTTONS.filter((item) => actions.includes(item.action)).map(({ action, code, icon: Icon }) => (
            <Buttons key={action} onClick={() => setDialog(action)} className='rounded-full'>
              <Icon className='h-4 w-4' aria-hidden='true' />
              {t(`actions.${code}` as never)}
            </Buttons>
          ))}
        </div>
      </div>

      <div className='flex flex-col gap-5 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6'>
        <StatCards items={summary} />

        <div className='grid gap-4 lg:grid-cols-3'>
          <div className='rounded-xl border border-border/70 bg-background/60 p-5 lg:col-span-2'>
            <h3 className='text-base font-semibold text-foreground'>{t("timelineTitle")}</h3>
            {state === "X" ? (
              <p role='status' className='mt-3 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm'>
                {t("rejectedNotice", { reason: devolution.rejected_reason ?? devolution.inspection_notes ?? "—" })}
                {devolution.rejected_at ? (
                  <span className='mt-1 block text-xs text-muted-foreground'>{who(devolution.rejected_by, devolution.rejected_at)}</span>
                ) : null}
              </p>
            ) : (
              <ol className='mt-4 grid gap-3 sm:grid-cols-5'>
                {TIMELINE.map((step, index) => {
                  const reached = index <= reachedIndex;
                  return (
                    <li
                      key={step}
                      aria-current={step === state ? "step" : undefined}
                      className={`rounded-xl border p-3 text-sm ${reached ? "border-primary/40 bg-primary/5" : "border-border opacity-60"}`}>
                      <p className='font-semibold text-foreground'>{tStates(step)}</p>
                      <p className='mt-1 break-words text-xs text-muted-foreground'>{timelineInfo[step] ?? (reached ? "✓" : "—")}</p>
                    </li>
                  );
                })}
              </ol>
            )}
            {devolution.inspection_notes && state !== "X" ? (
              <p className='mt-3 text-sm text-muted-foreground'>
                <span className='font-medium text-foreground'>{t("fields.inspectionNotes")}:</span> {devolution.inspection_notes}
              </p>
            ) : null}
          </div>

          <dl className='space-y-3 rounded-xl border border-border/70 bg-background/60 p-5 text-sm'>
            <div>
              <dt className='text-muted-foreground'>{t("fields.motiveDevolutionId")}</dt>
              <dd className='font-medium text-foreground'>{names.motives.get(devolution.motive_devolution_id ?? -1) ?? "—"}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>{t("fields.returnMethodId")}</dt>
              <dd className='font-medium text-foreground'>{names.returnMethods.get(devolution.return_method_id ?? -1) ?? "—"}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>{t("fields.refundMethodId")}</dt>
              <dd className='font-medium text-foreground'>{names.refundMethods.get(devolution.refund_method_id ?? -1) ?? "—"}</dd>
            </div>
            {state === "I" || state === "F" ? (
              <div>
                <dt className='text-muted-foreground'>{tf("warehouse")}</dt>
                <dd className='font-medium text-foreground'>
                  {devolution.warehouse_id != null ? names.warehouses.get(devolution.warehouse_id) ?? `#${devolution.warehouse_id}` : tf("mainWarehouse")}
                </dd>
              </div>
            ) : null}
            <div>
              <dt className='text-muted-foreground'>{t("fields.externalReference")}</dt>
              <dd className='font-medium text-foreground'>{devolution.external_reference || "—"}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>{t("fields.observation")}</dt>
              <dd className='whitespace-pre-line text-foreground'>{devolution.observation || "—"}</dd>
            </div>
          </dl>
        </div>

        {state === "F" ? (
          <div className='grid gap-4 lg:grid-cols-2'>
            <div className='rounded-xl border border-border/70 bg-background/60 p-5 text-sm'>
              <h3 className='text-base font-semibold text-foreground'>{tf("refundTitle")}</h3>
              {devolution.refund_detail ? (
                <ul className='mt-3 space-y-1'>
                  {devolution.refund_detail.split("; ").map((item) => (
                    <li key={item} className='font-mono text-xs'>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='mt-3 text-muted-foreground'>{tf("noMoneyRefund")}</p>
              )}
            </div>
            <div className='rounded-xl border border-border/70 bg-background/60 p-5 text-sm'>
              <h3 className='text-base font-semibold text-foreground'>{tf("creditNoteTitle")}</h3>
              {creditNotes.length > 0 ? (
                <ul className='mt-3 space-y-2'>
                  {creditNotes.map((note) => (
                    <li key={note.id} className='flex items-center justify-between gap-2'>
                      <Link
                        href={`/facturacion/invoices/${note.id}`}
                        className='font-mono font-semibold text-primary underline-offset-4 hover:underline'>
                        {note.full_number}
                      </Link>
                      <span className='flex items-center gap-2'>
                        <span className='tabular-nums'>{formatMoney(note.total)}</span>
                        <Badge variant={note.status === "ISSUED" ? "default" : "outline"}>{note.status}</Badge>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='mt-3 text-muted-foreground'>{tf("noCreditNote")}</p>
              )}
            </div>
          </div>
        ) : null}

        <div className='space-y-3'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <h3 className='text-base font-semibold text-foreground'>{tDetails("title")}</h3>
              <p className='text-sm text-muted-foreground'>{canEditLines ? tf("linesEditable") : tf("linesLocked")}</p>
            </div>
            {canEditLines ? (
              <Buttons
                size='sm'
                disabled={!returnable?.lines?.some((line) => (line.returnable ?? 0) > 0)}
                onClick={() => setDetailModal({ open: true, detail: null })}
                className='rounded-full'>
                <HiOutlinePlusCircle className='h-4 w-4' aria-hidden='true' />
                {tDetails("create")}
              </Buttons>
            ) : null}
          </div>
          <DataGrid<IDevolutionDetail>
            mode='client'
            embedded
            id='devolution-details'
            caption={tDetails("title")}
            data={details}
            columns={detailColumns}
            getRowId={(detail) => String(detail.id)}
            searchText={(detail) => `${detail.product_name ?? ""} ${detail.sku_code ?? ""}`}
            rowActions={detailRowActions}
            emptyState={{ title: tDetails("emptyTitle"), description: tDetails("emptyDescription") }}
          />
        </div>

        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <h3 className='text-base font-semibold text-foreground'>{tEvidences("title")}</h3>
            <Buttons size='sm' variant='outline' onClick={() => setEvidenceOpen(true)} className='rounded-full'>
              <HiOutlinePlusCircle className='h-4 w-4' aria-hidden='true' />
              {tEvidences("create")}
            </Buttons>
          </div>
          {evidences.length === 0 ? (
            <div className='rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground'>
              {tEvidences("emptyDescription")}
            </div>
          ) : (
            <ul className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
              {evidences.map((evidence) => (
                <li key={evidence.id} className='flex flex-col gap-2 rounded-xl border border-border/70 bg-background/60 p-4'>
                  <div className='flex items-center justify-between gap-2'>
                    <span className='inline-flex items-center gap-1.5 text-sm font-semibold text-foreground'>
                      <HiOutlineDocumentText className='h-4 w-4 text-primary' aria-hidden='true' />
                      {evidence.evidence_type ? tEvidences(`types.${evidence.evidence_type}` as never) : "—"}
                    </span>
                    <Buttons
                      size='sm'
                      variant='ghost'
                      aria-label={tCommon("deleteAria", { name: evidence.evidence_type ?? `#${evidence.id}` })}
                      className='rounded-full text-destructive hover:text-destructive'
                      onClick={() =>
                        evidence.id != null &&
                        confirmDelete(evidence.evidence_type ?? `#${evidence.id}`, () =>
                          deleteDevolutionEvidenceServerAction(evidence.id as number),
                        )
                      }>
                      <HiOutlineTrash className='h-4 w-4' aria-hidden='true' />
                    </Buttons>
                  </div>
                  {evidence.description ? <p className='text-sm text-muted-foreground'>{evidence.description}</p> : null}
                  <a
                    href={evidence.resource_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-1 truncate text-sm text-primary underline-offset-4 hover:underline'>
                    <HiOutlineLink className='h-4 w-4 shrink-0' aria-hidden='true' />
                    <span className='truncate'>{evidence.resource_url}</span>
                  </a>
                  <p className='text-xs text-muted-foreground'>
                    {evidence.recorded_by || "—"} · {formatDateTime(evidence.recorded_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ReturnActionDialog
        action={dialog}
        devolution={devolution}
        catalogs={catalogs}
        returnable={returnable}
        warehouses={warehouses}
        onClose={() => setDialog(null)}
      />

      <Modal size='lg' title={t("editTitle")} open={editing} onOpenChange={setEditing} hideDefaultFooter={true}>
        {editing ? <UpdateDevolution devolution={devolution} catalogs={catalogs} handleClose={() => setEditing(false)} /> : null}
      </Modal>

      <Modal
        size='lg'
        title={detailModal.detail ? tDetails("editTitle") : tDetails("createTitle")}
        open={detailModal.open}
        onOpenChange={(open) => {
          if (!open) setDetailModal({ open: false, detail: null });
        }}
        hideDefaultFooter={true}>
        {detailModal.open ? (
          <DevolutionDetailForm
            devolutionId={devolutionId}
            detail={detailModal.detail}
            lines={(returnable?.lines ?? []).filter((line) =>
              detailModal.detail
                ? line.product_order_id === detailModal.detail.product_order_id
                : !details.some((detail) => detail.product_order_id === line.product_order_id),
            )}
            handleClose={() => setDetailModal({ open: false, detail: null })}
          />
        ) : null}
      </Modal>

      <Modal size='lg' title={tEvidences("createTitle")} open={evidenceOpen} onOpenChange={setEvidenceOpen} hideDefaultFooter={true}>
        {evidenceOpen ? <EvidenceForm devolutionId={devolutionId} handleClose={() => setEvidenceOpen(false)} /> : null}
      </Modal>
    </section>
  );
};
