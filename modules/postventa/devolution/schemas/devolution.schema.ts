/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";
import { DETAIL_CONDITIONS, EVIDENCE_TYPES } from "../constants";

const optionalId = () =>
  z
    .union([z.literal(""), z.coerce.number().int().positive()])
    .optional()
    .transform((value) => (value === "" || value == null ? undefined : value));

export const validationDevolution = () => {
  const intl = useTranslations("Form");
  const requiredId = () =>
    z.coerce
      .number({ invalid_type_error: intl("requiredField") })
      .int()
      .positive({ message: intl("requiredField") });

  return z.object({
    orderId: requiredId(),
    motiveDevolutionId: requiredId(),
    returnMethodId: optionalId(),
    refundMethodId: optionalId(),
    observation: z.string().trim().min(1, { message: intl("requiredField") }),
    externalReference: z.string().trim().max(50).optional(),
  });
};

export const validationDevolutionDetail = () => {
  const intl = useTranslations("Form");
  const number = () => z.coerce.number({ invalid_type_error: intl("requiredField") });

  return z.object({
    productOrderId: number().int().positive({ message: intl("requiredField") }),
    quantity: number().int().positive({ message: intl("positiveNumber") }),
    receivedQuantity: number().int().min(0, { message: intl("requiredField") }),
    unitPrice: number().min(0, { message: intl("requiredField") }),
    restockingFee: number().min(0, { message: intl("requiredField") }),
    condition: z.enum(DETAIL_CONDITIONS, { errorMap: () => ({ message: intl("requiredField") }) }),
    observation: z.string().trim().min(1, { message: intl("requiredField") }),
  });
};

export const validationDevolutionEvidence = () => {
  const intl = useTranslations("Form");

  return z.object({
    evidenceType: z.enum(EVIDENCE_TYPES, { errorMap: () => ({ message: intl("requiredField") }) }),
    resourceUrl: z.string().trim().url({ message: intl("invalidUrl") }),
    description: z.string().optional(),
    recordedBy: z.string().optional(),
  });
};

export type DevolutionFormValues = z.infer<ReturnType<typeof validationDevolution>>;
export type DevolutionDetailFormValues = z.infer<ReturnType<typeof validationDevolutionDetail>>;
export type DevolutionEvidenceFormValues = z.infer<ReturnType<typeof validationDevolutionEvidence>>;
