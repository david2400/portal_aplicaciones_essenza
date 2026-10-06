/** @format */

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { confirm, notify, prompt } from "@/components/notifications";
import { Modal } from "@repo/ui/modals/scenes/dialog/modal";
import { Buttons } from "@repo/ui/buttons/scenes";
import {
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
  HiOutlineDocumentText,
  HiOutlineLink,
  HiOutlinePencilSquare,
  HiOutlinePlusCircle,
  HiOutlineTrash,
} from "react-icons/hi2";
import { DataGrid, type GridColumn, type RowAction } from "@/components/data-grid";
import { StatCards } from "@/components/stat-cards";
import { Link } from "@/shared/i18n/routing";
import { DevolutionDetailForm, EvidenceForm, UpdateDevolution } from "./form";
import { DevolutionStatusBadge } from "./devolution-status-badge";
import {
  DEVOLUTION_NEXT,
  formatDateTime,
  formatMoney,
  isDevolutionState,
  nowLocalDateTime,
  type DevolutionState,
} from "../constants";
import type {
  IDevolution,
  IDevolutionCatalogs,
  IDevolutionDetail,
  IDevolutionEvidence,
  IDevolutionOrderLine,
} from "../models/devolution.interface";
import {
  deleteDevolutionDetailServerAction,
  deleteDevolutionEvidenceServerAction,
  transitionDevolutionServerAction,
  type DevolutionTransitionPatch,
} from "@/app/[locale]/postventa/devolutions/actions";

interface IDevolutionDetailProps {
  devolution: IDevolution;
  details: IDevolutionDetail[];
  evidences: IDevolutionEvidence[];
  lines: IDevolutionOrderLine[];
  catalogs: IDevolutionCatalogs;
}

const TIMELINE: DevolutionState[] = ["P", "A", "R", "I", "F"];

export const DevolutionDetail = ({
  devolution,
  details,
  evidences,
  lines,
  catalogs,
}: IDevolutionDetailProps) => {
  const router = useRouter();
  const t = useTranslations("Administre.devolution");
  const tStates = useTranslations("Administre.devolution.states");
  const tDetails = useTranslations("Administre.devolution.details");
  const tEvidences = useTranslations("Administre.devolution.evidences");
  const tCommon = useTranslations("Administre.common");

  const [editing, setEditing] = useState(false);
  const [detailModal, setDetailModal] = useState<{ open: boolean; detail: IDevolutionDetail | null }>({
    open: false,
    detail: null,
  });
  const [evidenceOpen, setEvidenceOpen] = useState(false);

  const state: DevolutionState = isDevolutionState(devolution.state) ? devolution.state : "P";
  const closed = state === "F" || state === "X";
  const devolutionId = devolution.id ?? 0;

  const names = useMemo(() => {
    const toMap = (items: IDevolutionCatalogs["motives"]) =>
      new Map(items.map((item) => [item.id ?? -1, item.name ?? `#${item.id}`]));
    return {
      motives: toMap(catalogs.motives),
      returnMethods: toMap(catalogs.returnMethods),
      refundMethods: toMap(catalogs.refundMethods),
      lines: new Map(lines.map((line) => [line.id ?? -1, line.product_name])),
    };
  }, [catalogs, lines]);

  const refundSum = useMemo(
    () => details.reduce((acc, detail) => acc + (detail.refund_amount ?? 0), 0),
    [details],
  );

  const showError = (message?: string) =>
    notify.error(tCommon("errorTitle"), message || tCommon("unexpectedError"));

  const applyTransition = async (patch: DevolutionTransitionPatch) => {
    const response = await transitionDevolutionServerAction(devolutionId, patch);
    if (response.success) {
      notify.success(t("transitionDone"));
      router.refresh();
    } else {
      showError(response.error);
    }
  };

  const askText = async (title: string, label: string, textarea = false) => {
    const value = await prompt({
      title,
      confirmLabel: tCommon("save"),
      input: { label, multiline: textarea, required: true },
    });
    return value?.trim() || null;
  };

  const handleTransition = async (next: DevolutionState) => {
    if (next === "A") {
      const approvedBy = await askText(t("actions.A"), t("fields.approvedBy"));
      if (approvedBy) await applyTransition({ state: "A", approved_by: approvedBy, approved_at: nowLocalDateTime() });
      return;
    }
    if (next === "X") {
      const reason = await askText(t("actions.X"), t("rejectReason"), true);
      if (reason) await applyTransition({ state: "X", inspection_notes: reason });
      return;
    }
    if (next === "R") {
      const receivedBy = await askText(t("actions.R"), t("fields.receivedBy"));
      if (receivedBy) await applyTransition({ state: "R", received_by: receivedBy, received_at: nowLocalDateTime() });
      return;
    }
    if (next === "I") {
      const inspectionNotes = await askText(t("actions.I"), t("fields.inspectionNotes"), true);
      if (inspectionNotes) {
        await applyTransition({ state: "I", inspection_notes: inspectionNotes, total_refund_amount: refundSum });
      }
      return;
    }
    if (next === "F") {
      const ok = await confirm({
        title: t("actions.F"),
        description: t("refundConfirm", { amount: formatMoney(refundSum) }),
        confirmLabel: t("actions.F"),
      });
      if (ok) await applyTransition({ state: "F", total_refund_amount: refundSum });
    }
  };

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
      accessorKey: "product_order_id",
      header: tDetails("fields.productOrderId"),
      meta: { label: tDetails("fields.productOrderId"), hideable: false },
      cell: ({ row }) => (
        <span className='font-semibold text-foreground'>
          {names.lines.get(row.original.product_order_id ?? -1) ?? `#${row.original.product_order_id}`}
        </span>
      ),
    },
    {
      accessorKey: "quantity",
      header: tDetails("fields.quantity"),
      meta: { label: tDetails("fields.quantity"), align: "right", exportValue: (row) => row.quantity },
      cell: ({ row }) => <span className='tabular-nums'>{row.original.quantity ?? "—"}</span>,
    },
    {
      accessorKey: "received_quantity",
      header: tDetails("fields.receivedQuantity"),
      meta: {
        label: tDetails("fields.receivedQuantity"),
        align: "right",
        exportValue: (row) => row.received_quantity,
      },
      cell: ({ row }) => <span className='tabular-nums'>{row.original.received_quantity ?? 0}</span>,
    },
    {
      accessorKey: "condition",
      header: tDetails("fields.condition"),
      meta: { label: tDetails("fields.condition"), exportValue: (row) => row.condition },
      cell: ({ row }) =>
        row.original.condition ? tDetails(`conditions.${row.original.condition}` as never) : "—",
    },
    {
      accessorKey: "unit_price",
      header: tDetails("fields.unitPrice"),
      meta: { label: tDetails("fields.unitPrice"), align: "right", exportValue: (row) => row.unit_price },
      cell: ({ row }) => <span className='tabular-nums'>{formatMoney(row.original.unit_price)}</span>,
    },
    {
      accessorKey: "restocking_fee",
      header: tDetails("fields.restockingFee"),
      meta: {
        label: tDetails("fields.restockingFee"),
        align: "right",
        exportValue: (row) => row.restocking_fee,
      },
      cell: ({ row }) => <span className='tabular-nums'>{formatMoney(row.original.restocking_fee)}</span>,
    },
    {
      accessorKey: "refund_amount",
      header: tDetails("fields.refundAmount"),
      meta: {
        label: tDetails("fields.refundAmount"),
        align: "right",
        exportValue: (row) => row.refund_amount,
      },
      cell: ({ row }) => (
        <span className='font-medium tabular-nums'>{formatMoney(row.original.refund_amount)}</span>
      ),
    },
  ];

  const detailRowActions = (detail: IDevolutionDetail): RowAction[] => {
    if (closed) return [];
    const name = names.lines.get(detail.product_order_id ?? -1) ?? `#${detail.id}`;
    return [
      {
        label: tCommon("edit"),
        icon: HiOutlinePencilSquare,
        onSelect: () => setDetailModal({ open: true, detail }),
      },
      {
        label: tCommon("delete"),
        icon: HiOutlineTrash,
        tone: "danger",
        separated: true,
        disabled: detail.id == null,
        onSelect: () =>
          void confirmDelete(name, () => deleteDevolutionDetailServerAction(detail.id as number)),
      },
    ];
  };

  const summary = [
    { label: t("fields.state"), value: <DevolutionStatusBadge state={devolution.state} /> },
    {
      label: t("fields.orderId"),
      value:
        devolution.order_id != null ? (
          <Link
            href={`/ventas/orders/${devolution.order_id}`}
            className='text-primary underline-offset-4 hover:underline'>
            #{devolution.order_id}
          </Link>
        ) : (
          "—"
        ),
    },
    {
      label: t("fields.motiveDevolutionId"),
      value: names.motives.get(devolution.motive_devolution_id ?? -1) ?? "—",
    },
    {
      label: t("fields.totalRefundAmount"),
      value: formatMoney(devolution.total_refund_amount ?? refundSum),
    },
  ];

  const timelineInfo: Partial<Record<DevolutionState, string | undefined>> = {
    P: devolution.created_at ? formatDateTime(devolution.created_at) : undefined,
    A: devolution.approved_at
      ? `${devolution.approved_by ?? "—"} · ${formatDateTime(devolution.approved_at)}`
      : undefined,
    R: devolution.received_at
      ? `${devolution.received_by ?? "—"} · ${formatDateTime(devolution.received_at)}`
      : undefined,
    I: state === "I" || state === "F" ? devolution.inspection_notes : undefined,
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
          <h2 className='text-xl font-semibold tracking-tight text-foreground'>
            {t("devolutionLabel", { id: devolution.id ?? "—" })}
          </h2>
        </div>
        <div className='flex flex-wrap gap-2'>
          {!closed ? (
            <Buttons variant='outline' onClick={() => setEditing(true)} className='rounded-full'>
              <HiOutlinePencilSquare className='h-4 w-4' aria-hidden='true' />
              {t("editTitle")}
            </Buttons>
          ) : null}
          {DEVOLUTION_NEXT[state].map((next) => (
            <Buttons
              key={next}
              variant={next === "X" ? "danger" : "default"}
              onClick={() => handleTransition(next)}
              className='rounded-full'>
              {next === "X" ? null : <HiOutlineCheckCircle className='h-4 w-4' aria-hidden='true' />}
              {t(`actions.${next}`)}
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
                {t("rejectedNotice", { reason: devolution.inspection_notes ?? "—" })}
              </p>
            ) : (
              <ol className='mt-4 grid gap-3 sm:grid-cols-5'>
                {TIMELINE.map((step, index) => {
                  const reached = index <= reachedIndex;
                  return (
                    <li
                      key={step}
                      aria-current={step === state ? "step" : undefined}
                      className={`rounded-xl border p-3 text-sm ${
                        reached ? "border-primary/40 bg-primary/5" : "border-border opacity-60"
                      }`}>
                      <p className='font-semibold text-foreground'>{tStates(step)}</p>
                      <p className='mt-1 break-words text-xs text-muted-foreground'>
                        {timelineInfo[step] ?? (reached ? "✓" : "—")}
                      </p>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          <dl className='space-y-3 rounded-xl border border-border/70 bg-background/60 p-5 text-sm'>
            <div>
              <dt className='text-muted-foreground'>{t("fields.returnMethodId")}</dt>
              <dd className='font-medium text-foreground'>
                {names.returnMethods.get(devolution.return_method_id ?? -1) ?? "—"}
              </dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>{t("fields.refundMethodId")}</dt>
              <dd className='font-medium text-foreground'>
                {names.refundMethods.get(devolution.refund_method_id ?? -1) ?? "—"}
              </dd>
            </div>
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

        <div className='space-y-3'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <h3 className='text-base font-semibold text-foreground'>{tDetails("title")}</h3>
              <p className='text-sm text-muted-foreground'>
                {tDetails("refundSum", { amount: formatMoney(refundSum) })}
              </p>
            </div>
            {!closed ? (
              <Buttons
                size='sm'
                disabled={lines.length === 0}
                onClick={() => setDetailModal({ open: true, detail: null })}
                className='rounded-full'>
                <HiOutlinePlusCircle className='h-4 w-4' aria-hidden='true' />
                {tDetails("create")}
              </Buttons>
            ) : null}
          </div>
          {lines.length === 0 ? (
            <p role='status' className='text-sm text-muted-foreground'>
              {tDetails("noOrderLines")}
            </p>
          ) : null}
          <DataGrid<IDevolutionDetail>
            mode='client'
            embedded
            id='devolution-details'
            caption={tDetails("title")}
            data={details}
            columns={detailColumns}
            getRowId={(detail) => String(detail.id)}
            searchText={(detail) => names.lines.get(detail.product_order_id ?? -1) ?? ""}
            rowActions={detailRowActions}
            emptyState={{
              title: tDetails("emptyTitle"),
              description: tDetails("emptyDescription"),
            }}
          />
        </div>

        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <h3 className='text-base font-semibold text-foreground'>{tEvidences("title")}</h3>
            <Buttons
              size='sm'
              variant='outline'
              onClick={() => setEvidenceOpen(true)}
              className='rounded-full'>
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
                <li
                  key={evidence.id}
                  className='flex flex-col gap-2 rounded-xl border border-border/70 bg-background/60 p-4'>
                  <div className='flex items-center justify-between gap-2'>
                    <span className='inline-flex items-center gap-1.5 text-sm font-semibold text-foreground'>
                      <HiOutlineDocumentText className='h-4 w-4 text-primary' aria-hidden='true' />
                      {evidence.evidence_type
                        ? tEvidences(`types.${evidence.evidence_type}` as never)
                        : "—"}
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
                  {evidence.description ? (
                    <p className='text-sm text-muted-foreground'>{evidence.description}</p>
                  ) : null}
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

      <Modal size='lg' title={t("editTitle")} open={editing} onOpenChange={setEditing} hideDefaultFooter={true}>
        {editing ? (
          <UpdateDevolution devolution={devolution} catalogs={catalogs} handleClose={() => setEditing(false)} />
        ) : null}
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
            lines={lines}
            handleClose={() => setDetailModal({ open: false, detail: null })}
          />
        ) : null}
      </Modal>

      <Modal
        size='lg'
        title={tEvidences("createTitle")}
        open={evidenceOpen}
        onOpenChange={setEvidenceOpen}
        hideDefaultFooter={true}>
        {evidenceOpen ? (
          <EvidenceForm devolutionId={devolutionId} handleClose={() => setEvidenceOpen(false)} />
        ) : null}
      </Modal>
    </section>
  );
};
