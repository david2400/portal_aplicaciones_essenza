/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";
import { TAX_KINDS } from "../models/taxRate.interface";

export const validationTaxRate = () => {
  const intl = useTranslations("Form");
  const t = useTranslations("Administre.billing.taxRate.validation");
  return z
    .object({
      code: z.string().trim().regex(/^[A-Z][A-Z0-9_]{1,29}$/, t("code")),
      name: z.string().trim().min(1, intl("requiredField")).max(120),
      description: z.string().trim().max(255).optional(),
      kind: z.enum(TAX_KINDS),
      rate: z.coerce.number().min(0, t("rate")).max(100, t("rate")),
      is_default: z.boolean(),
      active: z.boolean(),
      position: z.coerce.number().int().min(0),
    })
    .superRefine((values, ctx) => {
      if (values.kind === "EXCLUDED" && values.rate !== 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["rate"], message: t("excluded") });
      }
      if (values.is_default && !values.active) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["active"], message: t("defaultActive") });
      }
    });
};

export type TaxRateFormValues = z.infer<ReturnType<typeof validationTaxRate>>;
