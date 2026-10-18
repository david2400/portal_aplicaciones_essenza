/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";
import { DETAIL_CONDITIONS, EVIDENCE_TYPES } from "../constants";

const optionalId = () =>
  z
    .union([z.literal(""), z.coerce.number().int().positive()])
    .optional()
    .transform((value) => (value === "" || value == null ? undefined : value));

/** Texto opcional sin transformar (el formulario y el envío usan el mismo tipo). */
const optionalText = (max: number) => z.string().trim().max(max).optional();

/** Id elegido en un select: string ("" = ninguno); se convierte al enviar. */
const selectId = () => z.string().optional();

/** "" | "12" → undefined | 12 */
export const toId = (value?: string | number | null) => {
  if (value == null || value === "") return undefined;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : undefined;
};

/** Datos generales (pendiente o aprobada): la orden no cambia. */
export const validationDevolution = () => {
  const intl = useTranslations("Form");
  return z.object({
    motive_devolution_id: z.coerce.number({ invalid_type_error: intl("requiredField") }).int().positive({ message: intl("requiredField") }),
    return_method_id: optionalId(),
    refund_method_id: optionalId(),
    observation: z.string().trim().min(1, { message: intl("requiredField") }).max(255, { message: intl("maxLength", { max: 255 }) }),
    external_reference: z.string().trim().max(50, { message: intl("maxLength", { max: 50 }) }).optional(),
  });
};

/** Solicitud: cantidades por línea (0 = no se devuelve) y al menos una unidad. */
export const validationRequestReturn = () => {
  const intl = useTranslations("Form");
  const tr = useTranslations("Administre.devolution.request");
  return z
    .object({
      motive_devolution_id: z.string().min(1, { message: intl("requiredField") }),
      return_method_id: selectId(),
      refund_method_id: selectId(),
      observation: z.string().trim().min(1, { message: intl("requiredField") }).max(255, { message: intl("maxLength", { max: 255 }) }),
      external_reference: z.string().trim().max(50, { message: intl("maxLength", { max: 50 }) }).optional(),
      lines: z.array(
        z
          .object({
            product_order_id: z.number(),
            returnable: z.number(),
            quantity: z.coerce.number().int().min(0, { message: intl("requiredField") }),
            observation: optionalText(255),
          })
          .refine((line) => line.quantity <= line.returnable, {
            message: tr("tooMany"),
            path: ["quantity"],
          }),
      ),
    })
    .refine((form) => form.lines.some((line) => line.quantity > 0), { message: tr("noLines"), path: ["lines"] });
};

/** Producto en una devolución pendiente. */
export const validationDevolutionDetail = () => {
  const intl = useTranslations("Form");
  const number = () => z.coerce.number({ invalid_type_error: intl("requiredField") });
  return z.object({
    product_order_id: number().int().positive({ message: intl("requiredField") }),
    quantity: number().int().positive({ message: intl("positiveNumber") }),
    observation: z.string().trim().min(1, { message: intl("requiredField") }).max(255),
  });
};

export const validationApprove = () => z.object({ by: optionalText(100), return_method_id: selectId() });

export const validationReject = () => {
  const intl = useTranslations("Form");
  return z.object({
    by: optionalText(100),
    reason: z.string().trim().min(1, { message: intl("requiredField") }).max(255),
  });
};

export const validationReceive = () => {
  const t = useTranslations("Administre.devolution.flow");
  return z.object({
    by: optionalText(100),
    notes: optionalText(255),
    lines: z.array(
      z
        .object({ detail_id: z.number(), max: z.number(), received_quantity: z.coerce.number().int().min(0) })
        .refine((line) => line.received_quantity <= line.max, {
          message: t("receivedTooMany"),
          path: ["received_quantity"],
        }),
    ),
  });
};

export const validationInspect = () => {
  const intl = useTranslations("Form");
  const t = useTranslations("Administre.devolution.flow");
  return z.object({
    by: optionalText(100),
    notes: optionalText(255),
    warehouse_id: selectId(),
    lines: z.array(
      z
        .object({
          detail_id: z.number(),
          value: z.number(),
          condition: z.enum(DETAIL_CONDITIONS, { errorMap: () => ({ message: intl("requiredField") }) }),
          restock: z.boolean(),
          restocking_fee: z.coerce.number().min(0, { message: intl("requiredField") }),
        })
        .refine((line) => line.restocking_fee <= line.value, {
          message: t("feeTooHigh"),
          path: ["restocking_fee"],
        }),
    ),
  });
};

export const validationRefund = () => {
  const intl = useTranslations("Form");
  return z.object({
    by: optionalText(100),
    refund_method_id: selectId(),
    amount: z.coerce.number({ invalid_type_error: intl("requiredField") }).min(0, { message: intl("requiredField") }),
    notes: optionalText(255),
  });
};

export const validationDevolutionEvidence = () => {
  const intl = useTranslations("Form");

  return z.object({
    evidence_type: z.enum(EVIDENCE_TYPES, { errorMap: () => ({ message: intl("requiredField") }) }),
    resource_url: z.string().trim().url({ message: intl("invalidUrl") }),
    description: z.string().optional(),
    recorded_by: z.string().optional(),
  });
};

export type DevolutionFormValues = z.infer<ReturnType<typeof validationDevolution>>;
export type RequestReturnFormValues = z.infer<ReturnType<typeof validationRequestReturn>>;
export type DevolutionDetailFormValues = z.infer<ReturnType<typeof validationDevolutionDetail>>;
export type ApproveFormValues = z.infer<ReturnType<typeof validationApprove>>;
export type RejectFormValues = z.infer<ReturnType<typeof validationReject>>;
export type ReceiveFormValues = z.infer<ReturnType<typeof validationReceive>>;
export type InspectFormValues = z.infer<ReturnType<typeof validationInspect>>;
export type RefundFormValues = z.infer<ReturnType<typeof validationRefund>>;
export type DevolutionEvidenceFormValues = z.infer<ReturnType<typeof validationDevolutionEvidence>>;
