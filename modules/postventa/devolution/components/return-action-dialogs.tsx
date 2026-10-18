/** @format */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@repo/ui/modals/scenes/dialog/modal";
import { Buttons } from "@repo/ui/buttons/scenes";
import { FormField } from "@repo/ui/form/scenes/form-field";
import { FormTextAreaField } from "@repo/ui/form/scenes/form-area";
import { FormSelectField } from "@repo/ui/form/scenes/form-select";
import { Segmented, ToggleRow } from "@/components/form-sections";
import { notify } from "@/components/notifications";
import { DETAIL_CONDITIONS, formatMoney, lineValue, RESTOCK_BY_DEFAULT } from "../constants";
import type {
  IDevolution,
  IDevolutionCatalogs,
  IDevolutionOption,
  IReturnableOrder,
  ReturnAction,
} from "../models/devolution.interface";
import {
  toId,
  validationApprove,
  validationInspect,
  validationReceive,
  validationRefund,
  validationReject,
  type ApproveFormValues,
  type InspectFormValues,
  type ReceiveFormValues,
  type RefundFormValues,
  type RejectFormValues,
} from "../schemas/devolution.schema";
import {
  approveReturnServerAction,
  inspectReturnServerAction,
  receiveReturnServerAction,
  refundReturnServerAction,
  rejectReturnServerAction,
} from "@/app/[locale]/postventa/devolutions/actions";

type FlowResult = { success: true } | { success: false; error: string };

const toOptions = (items: IDevolutionOption[]) =>
  items.filter((item) => item.id != null).map((item) => ({ value: String(item.id), label: item.name ?? `#${item.id}` }));

const idOrEmpty = (value?: number | null) => (value != null ? String(value) : "");

interface DialogProps {
  devolution: IDevolution;
  onClose: () => void;
}

const useFlowFeedback = (onClose: () => void) => {
  const router = useRouter();
  const t = useTranslations("Administre.devolution.flow");
  const tCommon = useTranslations("Administre.common");
  return (result: FlowResult, done: string) => {
    if (!result.success) {
      notify.error(tCommon("errorTitle"), result.error);
      return;
    }
    notify.success(t(done as never));
    onClose();
    router.refresh();
  };
};

const Footer = ({ onClose, submitting, label, danger }: { onClose: () => void; submitting: boolean; label: string; danger?: boolean }) => {
  const tCommon = useTranslations("Administre.common");
  return (
    <div className='flex justify-end gap-2'>
      <Buttons type='button' variant='outline' className='rounded-full' onClick={onClose}>
        {tCommon("cancel")}
      </Buttons>
      <Buttons type='submit' variant={danger ? "danger" : "default"} loading={submitting} className='rounded-full'>
        {label}
      </Buttons>
    </div>
  );
};

// ─── Aprobar ─────────────────────────────────────────────────────────────────

const ApproveForm = ({ devolution, onClose, catalogs }: DialogProps & { catalogs: IDevolutionCatalogs }) => {
  const t = useTranslations("Administre.devolution");
  const tf = useTranslations("Administre.devolution.flow");
  const feedback = useFlowFeedback(onClose);
  const { control, handleSubmit, formState } = useForm<ApproveFormValues>({
    resolver: zodResolver(validationApprove()),
    defaultValues: { by: "", return_method_id: idOrEmpty(devolution.return_method_id) },
  });
  const submit = async (values: ApproveFormValues) => {
    const result = await approveReturnServerAction(devolution.id as number, {
      by: values.by || undefined,
      return_method_id: toId(values.return_method_id),
    });
    feedback(result, "approved");
  };
  return (
    <form onSubmit={handleSubmit(submit)} className='grid gap-4'>
      <p className='text-sm text-muted-foreground'>{tf("approveHint")}</p>
      <FormField controller={{ control, name: "by" }} label={t("fields.approvedBy")} />
      <FormSelectField
        controller={{ control, name: "return_method_id" }}
        label={t("fields.returnMethodId")}
        data={toOptions(catalogs.returnMethods)}
        triggerClassName='!w-full'
      />
      <Footer onClose={onClose} submitting={formState.isSubmitting} label={t("actions.A")} />
    </form>
  );
};

// ─── Rechazar ────────────────────────────────────────────────────────────────

const RejectForm = ({ devolution, onClose }: DialogProps) => {
  const t = useTranslations("Administre.devolution");
  const tf = useTranslations("Administre.devolution.flow");
  const feedback = useFlowFeedback(onClose);
  const { control, handleSubmit, formState } = useForm<RejectFormValues>({
    resolver: zodResolver(validationReject()),
    defaultValues: { by: "", reason: "" },
  });
  const submit = async (values: RejectFormValues) => {
    const result = await rejectReturnServerAction(devolution.id as number, { by: values.by || undefined, reason: values.reason });
    feedback(result, "rejected");
  };
  return (
    <form onSubmit={handleSubmit(submit)} className='grid gap-4'>
      <p className='text-sm text-muted-foreground'>{tf("rejectHint")}</p>
      <FormTextAreaField controller={{ control, name: "reason" }} label={t("rejectReason")} />
      <FormField controller={{ control, name: "by" }} label={tf("by")} />
      <Footer onClose={onClose} submitting={formState.isSubmitting} label={t("actions.X")} danger />
    </form>
  );
};

// ─── Recibir ─────────────────────────────────────────────────────────────────

const ReceiveForm = ({ devolution, onClose }: DialogProps) => {
  const t = useTranslations("Administre.devolution");
  const tf = useTranslations("Administre.devolution.flow");
  const feedback = useFlowFeedback(onClose);
  const details = devolution.details ?? [];
  const { control, handleSubmit, formState } = useForm<ReceiveFormValues>({
    resolver: zodResolver(validationReceive()),
    defaultValues: {
      by: "",
      notes: "",
      lines: details.map((detail) => ({
        detail_id: detail.id ?? 0,
        max: detail.quantity ?? 0,
        received_quantity: detail.quantity ?? 0,
      })),
    },
  });
  const { fields } = useFieldArray({ control, name: "lines" });
  const submit = async (values: ReceiveFormValues) => {
    const result = await receiveReturnServerAction(devolution.id as number, {
      by: values.by || undefined,
      notes: values.notes || undefined,
      lines: values.lines.map((line) => ({ detail_id: line.detail_id, received_quantity: Number(line.received_quantity) })),
    });
    feedback(result, "received");
  };
  return (
    <form onSubmit={handleSubmit(submit)} className='grid gap-4'>
      <p className='text-sm text-muted-foreground'>{tf("receiveHint")}</p>
      <ul className='grid gap-2'>
        {fields.map((field, index) => {
          const detail = details[index];
          return (
            <li key={field.id} className='flex items-center justify-between gap-3 rounded-xl border border-border p-3'>
              <div className='min-w-0'>
                <p className='truncate text-sm font-medium'>{detail?.product_name ?? `#${detail?.product_order_id}`}</p>
                <p className='text-xs text-muted-foreground'>{tf("requested", { count: detail?.quantity ?? 0 })}</p>
              </div>
              <FormField
                controller={{ control, name: `lines.${index}.received_quantity` }}
                type='number'
                min={0}
                max={detail?.quantity ?? 0}
                size='sm'
                className='w-28'
                aria-label={tf("receivedFor", { name: detail?.product_name ?? "" })}
                suffix={`/ ${detail?.quantity ?? 0}`}
              />
            </li>
          );
        })}
      </ul>
      <FormField controller={{ control, name: "by" }} label={t("fields.receivedBy")} />
      <FormTextAreaField controller={{ control, name: "notes" }} label={tf("notes")} />
      <Footer onClose={onClose} submitting={formState.isSubmitting} label={t("actions.R")} />
    </form>
  );
};

// ─── Inspeccionar ────────────────────────────────────────────────────────────

const InspectForm = ({
  devolution,
  onClose,
  returnable,
  warehouses,
}: DialogProps & { returnable: IReturnableOrder | null; warehouses: IDevolutionOption[] }) => {
  const t = useTranslations("Administre.devolution");
  const tf = useTranslations("Administre.devolution.flow");
  const tc = useTranslations("Administre.devolution.details.conditions");
  const feedback = useFlowFeedback(onClose);
  const details = devolution.details ?? [];
  const valueOf = (productOrderId?: number, received?: number) => {
    const line = returnable?.lines?.find((item) => item.product_order_id === productOrderId);
    return lineValue(line?.total, line?.sold, received ?? 0);
  };
  const { control, handleSubmit, setValue, formState } = useForm<InspectFormValues>({
    resolver: zodResolver(validationInspect()),
    defaultValues: {
      by: "",
      notes: "",
      warehouse_id: idOrEmpty(devolution.warehouse_id),
      lines: details.map((detail) => ({
        detail_id: detail.id ?? 0,
        value: valueOf(detail.product_order_id, detail.received_quantity),
        condition: "NEW",
        restock: true,
        restocking_fee: 0,
      })),
    },
  });
  const { fields } = useFieldArray({ control, name: "lines" });
  const lines = useWatch({ control, name: "lines" });
  const credit = (lines ?? []).reduce(
    (sum, line) => sum + Math.max(0, (line?.value ?? 0) - (Number(line?.restocking_fee) || 0)),
    0,
  );
  const submit = async (values: InspectFormValues) => {
    const result = await inspectReturnServerAction(devolution.id as number, {
      by: values.by || undefined,
      notes: values.notes || undefined,
      warehouse_id: toId(values.warehouse_id),
      lines: values.lines.map((line) => ({
        detail_id: line.detail_id,
        condition: line.condition,
        restock: line.restock,
        restocking_fee: Number(line.restocking_fee) || 0,
      })),
    });
    feedback(result, "inspected");
  };
  return (
    <form onSubmit={handleSubmit(submit)} className='grid gap-4'>
      <p className='text-sm text-muted-foreground'>{tf("inspectHint")}</p>
      <ul className='grid gap-3'>
        {fields.map((field, index) => {
          const detail = details[index];
          const received = detail?.received_quantity ?? 0;
          const line = lines?.[index];
          return (
            <li key={field.id} className='grid gap-3 rounded-xl border border-border p-3'>
              <div className='flex flex-wrap items-baseline justify-between gap-2'>
                <p className='text-sm font-medium'>{detail?.product_name ?? `#${detail?.product_order_id}`}</p>
                <p className='text-xs text-muted-foreground'>
                  {tf("receivedValue", { count: received, value: formatMoney(line?.value) })}
                </p>
              </div>
              {received === 0 ? (
                <p className='text-xs text-muted-foreground'>{tf("nothingReceived")}</p>
              ) : (
                <>
                  <Segmented
                    label={t("details.fields.condition")}
                    value={(line?.condition ?? "NEW") as (typeof DETAIL_CONDITIONS)[number]}
                    options={DETAIL_CONDITIONS.map((value) => ({ value, label: tc(value) }))}
                    onChange={(value) => {
                      setValue(`lines.${index}.condition`, value, { shouldDirty: true });
                      setValue(`lines.${index}.restock`, RESTOCK_BY_DEFAULT[value], { shouldDirty: true });
                    }}
                  />
                  <div className='grid gap-3 sm:grid-cols-2'>
                    <ToggleRow
                      id={`restock-${detail?.id}`}
                      label={tf("restock")}
                      description={tf("restockHint")}
                      checked={Boolean(line?.restock)}
                      onChange={(checked) => setValue(`lines.${index}.restock`, checked, { shouldDirty: true })}
                    />
                    <FormField
                      controller={{ control, name: `lines.${index}.restocking_fee` }}
                      type='number'
                      min={0}
                      step='any'
                      label={t("details.fields.restockingFee")}
                      description={tf("feeHint")}
                    />
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>
      <FormSelectField
        controller={{ control, name: "warehouse_id" }}
        label={tf("warehouse")}
        description={tf("warehouseHint")}
        data={toOptions(warehouses)}
        placeholder={tf("mainWarehouse")}
        triggerClassName='!w-full'
      />
      <FormField controller={{ control, name: "by" }} label={tf("by")} />
      <FormTextAreaField controller={{ control, name: "notes" }} label={t("fields.inspectionNotes")} />
      <p className='rounded-xl bg-muted/40 p-3 text-sm'>
        {tf("creditPreview")} <strong className='tabular-nums'>{formatMoney(credit)}</strong>
      </p>
      <Footer onClose={onClose} submitting={formState.isSubmitting} label={t("actions.I")} />
    </form>
  );
};

// ─── Reembolsar ──────────────────────────────────────────────────────────────

const RefundForm = ({
  devolution,
  onClose,
  catalogs,
  refundable,
}: DialogProps & { catalogs: IDevolutionCatalogs; refundable?: number }) => {
  const t = useTranslations("Administre.devolution");
  const tf = useTranslations("Administre.devolution.flow");
  const feedback = useFlowFeedback(onClose);
  const credit = devolution.total_refund_amount ?? 0;
  const suggested = Math.min(credit, refundable ?? credit);
  const { control, handleSubmit, setValue, formState } = useForm<RefundFormValues>({
    resolver: zodResolver(validationRefund()),
    defaultValues: { by: "", refund_method_id: idOrEmpty(devolution.refund_method_id), amount: suggested, notes: "" },
  });
  const amount = Number(useWatch({ control, name: "amount" })) || 0;
  useEffect(() => {
    setValue("amount", suggested);
  }, [suggested, setValue]);
  const submit = async (values: RefundFormValues) => {
    const result = await refundReturnServerAction(devolution.id as number, {
      by: values.by || undefined,
      refund_method_id: toId(values.refund_method_id),
      amount: Number(values.amount),
      notes: values.notes || undefined,
    });
    feedback(result, "refunded");
  };
  const storeCredit = Math.max(0, credit - amount);
  return (
    <form onSubmit={handleSubmit(submit)} className='grid gap-4'>
      <dl className='grid grid-cols-2 gap-3 rounded-xl border border-border p-3 text-sm'>
        <div>
          <dt className='text-xs text-muted-foreground'>{tf("credit")}</dt>
          <dd className='font-semibold tabular-nums'>{formatMoney(credit)}</dd>
        </div>
        <div>
          <dt className='text-xs text-muted-foreground'>{tf("refundable")}</dt>
          <dd className='font-semibold tabular-nums'>{refundable != null ? formatMoney(refundable) : "—"}</dd>
        </div>
      </dl>
      <FormField
        controller={{ control, name: "amount" }}
        type='number'
        min={0}
        max={credit}
        step='any'
        label={tf("amount")}
        description={tf("amountHint")}
      />
      {storeCredit > 0 ? (
        <p role='status' className='rounded-lg bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-300'>
          {tf("storeCredit", { amount: formatMoney(storeCredit) })}
        </p>
      ) : null}
      <FormSelectField
        controller={{ control, name: "refund_method_id" }}
        label={t("fields.refundMethodId")}
        data={toOptions(catalogs.refundMethods)}
        triggerClassName='!w-full'
      />
      <FormField controller={{ control, name: "by" }} label={tf("by")} />
      <FormTextAreaField controller={{ control, name: "notes" }} label={tf("notes")} />
      <p className='text-xs text-muted-foreground'>{tf("refundHint")}</p>
      <Footer onClose={onClose} submitting={formState.isSubmitting} label={t("actions.F")} />
    </form>
  );
};

// ─── Contenedor ──────────────────────────────────────────────────────────────

export type FlowDialog = Exclude<ReturnAction, "edit_lines"> | null;

const TITLES: Record<Exclude<FlowDialog, null>, string> = {
  approve: "A",
  reject: "X",
  receive: "R",
  inspect: "I",
  refund: "F",
};

/** Diálogo de la acción del flujo elegida (aprobar, rechazar, recibir, inspeccionar, reembolsar). */
export const ReturnActionDialog = ({
  action,
  devolution,
  catalogs,
  returnable,
  warehouses,
  onClose,
}: {
  action: FlowDialog;
  devolution: IDevolution;
  catalogs: IDevolutionCatalogs;
  returnable: IReturnableOrder | null;
  warehouses: IDevolutionOption[];
  onClose: () => void;
}) => {
  const t = useTranslations("Administre.devolution");
  return (
    <Modal
      size={action === "inspect" ? "lg" : "md"}
      open={action != null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={action ? t(`actions.${TITLES[action]}` as never) : ""}
      hideDefaultFooter>
      {action === "approve" ? <ApproveForm devolution={devolution} onClose={onClose} catalogs={catalogs} /> : null}
      {action === "reject" ? <RejectForm devolution={devolution} onClose={onClose} /> : null}
      {action === "receive" ? <ReceiveForm devolution={devolution} onClose={onClose} /> : null}
      {action === "inspect" ? (
        <InspectForm devolution={devolution} onClose={onClose} returnable={returnable} warehouses={warehouses} />
      ) : null}
      {action === "refund" ? (
        <RefundForm devolution={devolution} onClose={onClose} catalogs={catalogs} refundable={returnable?.refundable} />
      ) : null}
    </Modal>
  );
};
