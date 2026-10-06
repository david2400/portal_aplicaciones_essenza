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
    order_id: requiredId(),
    motive_devolution_id: requiredId(),
    return_method_id: optionalId(),
    refund_method_id: optionalId(),
    observation: z.string().trim().min(1, { message: intl("requiredField") }),
    external_reference: z.string().trim().max(50).optional(),
  });
};

export const validationDevolutionDetail = () => {
  const intl = useTranslations("Form");
  const number = () => z.coerce.number({ invalid_type_error: intl("requiredField") });

  return z.object({
    product_order_id: number().int().positive({ message: intl("requiredField") }),
    quantity: number().int().positive({ message: intl("positiveNumber") }),
    received_quantity: number().int().min(0, { message: intl("requiredField") }),
    unit_price: number().min(0, { message: intl("requiredField") }),
    restocking_fee: number().min(0, { message: intl("requiredField") }),
    condition: z.enum(DETAIL_CONDITIONS, { errorMap: () => ({ message: intl("requiredField") }) }),
    observation: z.string().trim().min(1, { message: intl("requiredField") }),
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
export type DevolutionDetailFormValues = z.infer<ReturnType<typeof validationDevolutionDetail>>;
export type DevolutionEvidenceFormValues = z.infer<ReturnType<typeof validationDevolutionEvidence>>;
