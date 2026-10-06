/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { notify } from "@/components/notifications";
import type { IFormAddProps } from "@repo/ui/form/models/form.interface";
import { FormDevolution } from "../scenes/formDevolution";
import { FormDevolutionDetail } from "../scenes/formDevolutionDetail";
import { FormEvidence } from "../scenes/formEvidence";
import {
  validationDevolution,
  validationDevolutionDetail,
  validationDevolutionEvidence,
  type DevolutionDetailFormValues,
  type DevolutionEvidenceFormValues,
  type DevolutionFormValues,
} from "../schemas/devolution.schema";
import type {
  IDevolution,
  IDevolutionCatalogs,
  IDevolutionDetail,
  IDevolutionOrderLine,
} from "../models/devolution.interface";
import { computeRefund, nowLocalDateTime } from "../constants";
import {
  createDevolutionDetailServerAction,
  createDevolutionEvidenceServerAction,
  createDevolutionServerAction,
  updateDevolutionDetailServerAction,
  updateDevolutionServerAction,
} from "@/app/[locale]/postventa/devolutions/actions";

type Result = { success: true } | { success: false; error: string };

const useFeedback = (handleClose?: IFormAddProps["handleClose"]) => {
  const router = useRouter();
  const t = useTranslations("Administre.common");

  return {
    done: (result: Result, successTitle: string) => {
      if (result.success) {
        notify.success(successTitle);
        handleClose?.(true);
        router.refresh();
      } else {
        notify.error(t("errorTitle"), result.error || t("unexpectedError"));
      }
    },
  };
};

const idToString = (value?: number) => (value != null ? String(value) : "");

// ─── Devolución ───────────────────────────────────────────────────────────────

export const RegisterDevolution = ({
  handleClose,
  catalogs,
}: IFormAddProps & { catalogs: IDevolutionCatalogs }) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);

  const handleSubmit = async (values: DevolutionFormValues) => {
    const result = await createDevolutionServerAction({ ...values, state: "P" });
    await feedback.done(result, t("createdSuccess"));
  };

  return (
    <FormDevolution
      initialValues={{
        order_id: "",
        motive_devolution_id: "",
        return_method_id: "",
        refund_method_id: "",
        observation: "",
        external_reference: "",
      }}
      onSubmit={handleSubmit}
      validationSchema={validationDevolution()}
      catalogs={catalogs}
    />
  );
};

export const UpdateDevolution = ({
  devolution,
  handleClose,
  catalogs,
}: IFormAddProps & { devolution: IDevolution; catalogs: IDevolutionCatalogs }) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);
  const validationSchema = validationDevolution();

  if (devolution.id == null) return null;
  const id = devolution.id;

  const handleSubmit = async (values: DevolutionFormValues) => {
    // El PUT valida el payload completo: se conservan los datos del flujo.
    const result = await updateDevolutionServerAction({
      id,
      state: devolution.state,
      total_refund_amount: devolution.total_refund_amount,
      approved_by: devolution.approved_by,
      approved_at: devolution.approved_at,
      received_by: devolution.received_by,
      received_at: devolution.received_at,
      inspection_notes: devolution.inspection_notes,
      ...values,
    });
    await feedback.done(result, t("updatedSuccess"));
  };

  return (
    <FormDevolution
      initialValues={{
        order_id: idToString(devolution.order_id),
        motive_devolution_id: idToString(devolution.motive_devolution_id),
        return_method_id: idToString(devolution.return_method_id),
        refund_method_id: idToString(devolution.refund_method_id),
        observation: devolution.observation ?? "",
        external_reference: devolution.external_reference ?? "",
      }}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      catalogs={catalogs}
    />
  );
};

// ─── Líneas devueltas ────────────────────────────────────────────────────────

export const DevolutionDetailForm = ({
  devolutionId,
  detail,
  lines,
  handleClose,
}: IFormAddProps & {
  devolutionId: number;
  detail?: IDevolutionDetail | null;
  lines: IDevolutionOrderLine[];
}) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);
  const validationSchema = validationDevolutionDetail();

  const handleSubmit = async (values: DevolutionDetailFormValues) => {
    const payload = {
      ...values,
      order_devolution_id: devolutionId,
      refund_amount: computeRefund(values.quantity, values.unit_price, values.restocking_fee),
    };
    const result =
      detail?.id != null
        ? await updateDevolutionDetailServerAction({ ...payload, id: detail.id })
        : await createDevolutionDetailServerAction(payload);
    await feedback.done(result, detail?.id != null ? t("updatedSuccess") : t("createdSuccess"));
  };

  const firstLine = lines[0];

  return (
    <FormDevolutionDetail
      initialValues={{
        product_order_id: idToString(detail?.product_order_id ?? firstLine?.id),
        quantity: detail?.quantity ?? 1,
        received_quantity: detail?.received_quantity ?? 0,
        unit_price: detail?.unit_price ?? firstLine?.unit_price ?? 0,
        restocking_fee: detail?.restocking_fee ?? 0,
        condition: detail?.condition ?? "OPENED",
        observation: detail?.observation ?? "",
      }}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      lines={lines}
    />
  );
};

// ─── Evidencias ──────────────────────────────────────────────────────────────

export const EvidenceForm = ({
  devolutionId,
  handleClose,
}: IFormAddProps & { devolutionId: number }) => {
  const t = useTranslations("Administre.common");
  const feedback = useFeedback(handleClose);

  const handleSubmit = async (values: DevolutionEvidenceFormValues) => {
    const result = await createDevolutionEvidenceServerAction({
      ...values,
      order_devolution_id: devolutionId,
      recorded_at: nowLocalDateTime(),
    });
    await feedback.done(result, t("createdSuccess"));
  };

  return (
    <FormEvidence
      initialValues={{ evidence_type: "PHOTO", resource_url: "", description: "", recorded_by: "" }}
      onSubmit={handleSubmit}
      validationSchema={validationDevolutionEvidence()}
    />
  );
};
