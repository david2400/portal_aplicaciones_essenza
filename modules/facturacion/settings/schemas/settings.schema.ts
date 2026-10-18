/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";

export const TAX_REGIMES = ["RESPONSABLE_IVA", "NO_RESPONSABLE_IVA"] as const;
export const ENVIRONMENTS = ["TEST", "PRODUCTION"] as const;

export const validationBillingSettings = () => {
  const t = useTranslations("Administre.billing.settings.validation");
  return z
    .object({
      nit: z.string().trim().regex(/^[\d.\-\s]*$/, t("nit")),
      legal_name: z.string().trim().max(200),
      trade_name: z.string().trim().max(200),
      tax_regime: z.enum(TAX_REGIMES),
      responsibilities: z.string().trim().max(120),
      address: z.string().trim().max(200),
      city: z.string().trim().max(120),
      department: z.string().trim().max(120),
      email: z.string().trim().email(t("email")).or(z.literal("")),
      phone: z.string().trim().max(40),
      environment: z.enum(ENVIRONMENTS),
      provider: z.string().min(1),
      software_id: z.string().trim().max(80),
      software_pin: z.string().trim().max(40),
      auto_invoice: z.boolean(),
      invoice_footer: z.string().trim().max(500),
    })
    .superRefine((v, ctx) => {
      const digits = v.nit.replace(/\D/g, "");
      if (digits && (digits.length < 5 || digits.length > 15)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["nit"], message: t("nitLength") });
      }
    });
};

export type BillingSettingsFormValues = z.infer<ReturnType<typeof validationBillingSettings>>;
