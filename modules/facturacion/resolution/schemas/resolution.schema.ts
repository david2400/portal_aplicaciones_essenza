/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";
import { BILLING_ENVIRONMENTS, RESOLUTION_KINDS } from "../models/resolution.interface";

const optionalDate = z.string().optional().or(z.literal(""));

export const validationResolution = () => {
  const intl = useTranslations("Form");
  const t = useTranslations("Administre.billing.resolution.validation");
  const required = intl("requiredField");
  return z
    .object({
      kind: z.enum(RESOLUTION_KINDS),
      environment: z.enum(BILLING_ENVIRONMENTS),
      prefix: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{0,4}$/, t("prefix")),
      resolution_number: z.string().trim().max(40).optional(),
      resolution_date: optionalDate,
      technical_key: z.string().trim().max(120).optional(),
      from_number: z.coerce.number({ invalid_type_error: required }).int().min(0),
      to_number: z.coerce.number({ invalid_type_error: required }).int().min(0),
      next_number: z.coerce.number().int().min(0),
      valid_from: optionalDate,
      valid_to: optionalDate,
      active: z.boolean(),
    })
    .superRefine((v, ctx) => {
      if (v.to_number < v.from_number) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["to_number"], message: t("range") });
      if (v.next_number < v.from_number || v.next_number > v.to_number + 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["next_number"], message: t("next") });
      }
      if (v.valid_from && v.valid_to && v.valid_to < v.valid_from) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["valid_to"], message: t("validity") });
      }
      if (v.kind === "INVOICE" && v.environment === "PRODUCTION") {
        if (!v.resolution_number) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["resolution_number"], message: t("production") });
        if (!v.technical_key) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["technical_key"], message: t("production") });
        if (!v.valid_to) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["valid_to"], message: t("production") });
      }
    });
};

export type ResolutionFormValues = z.infer<ReturnType<typeof validationResolution>>;
