/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Swal from "sweetalert2";
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
    done: (result: Result, successTitle: string) =>
      result.success
        ? Swal.fire({
            title: successTitle,
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            willClose: () => {
              handleClose?.(true);
              router.refresh();
            },
          })
        : Swal.fire({
            title: t("errorTitle"),
            text: result.error || t("unexpectedError"),
            icon: "error",
          }),
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
        orderId: "",
        motiveDevolutionId: "",
        returnMethodId: "",
        refundMethodId: "",
        observation: "",
        externalReference: "",
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
      totalRefundAmount: devolution.totalRefundAmount,
      approvedBy: devolution.approvedBy,
      approvedAt: devolution.approvedAt,
      receivedBy: devolution.receivedBy,
      receivedAt: devolution.receivedAt,
      inspectionNotes: devolution.inspectionNotes,
      ...values,
    });
    await feedback.done(result, t("updatedSuccess"));
  };

  return (
    <FormDevolution
      initialValues={{
        orderId: idToString(devolution.orderId),
        motiveDevolutionId: idToString(devolution.motiveDevolutionId),
        returnMethodId: idToString(devolution.returnMethodId),
        refundMethodId: idToString(devolution.refundMethodId),
        observation: devolution.observation ?? "",
        externalReference: devolution.externalReference ?? "",
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
      orderDevolutionId: devolutionId,
      refundAmount: computeRefund(values.quantity, values.unitPrice, values.restockingFee),
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
        productOrderId: idToString(detail?.productOrderId ?? firstLine?.id),
        quantity: detail?.quantity ?? 1,
        receivedQuantity: detail?.receivedQuantity ?? 0,
        unitPrice: detail?.unitPrice ?? firstLine?.unitPrice ?? 0,
        restockingFee: detail?.restockingFee ?? 0,
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
      orderDevolutionId: devolutionId,
      recordedAt: nowLocalDateTime(),
    });
    await feedback.done(result, t("createdSuccess"));
  };

  return (
    <FormEvidence
      initialValues={{ evidenceType: "PHOTO", resourceUrl: "", description: "", recordedBy: "" }}
      onSubmit={handleSubmit}
      validationSchema={validationDevolutionEvidence()}
    />
  );
};
