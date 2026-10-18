/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";
import { GATEWAY_PROVIDERS, KIND_CHANNELS, KINDS_WITH_CHANGE, PAYMENT_CHANNELS, PAYMENT_KINDS } from "../models/paymentMethod.interface";

const optionalMoney = z.preprocess(
  (value) => (value === "" || value == null ? undefined : value),
  z.coerce.number().min(0).optional(),
);

/** Mismas reglas que el dominio del backend (canal según tipo, pasarela, cambio, límites). */
export const validationPaymentMethod = () => {
  const intl = useTranslations("Form");
  const t = useTranslations("Administre.paymentMethod.validation");
  const required = { message: intl("requiredField") };

  return z
    .object({
      name: z.string().trim().min(1, required).max(120),
      code: z
        .string()
        .trim()
        .regex(/^([A-Z][A-Z0-9_]{1,39})?$/, t("code"))
        .optional(),
      description: z.string().trim().max(255).optional(),
      instructions: z.string().trim().max(1000).optional(),
      channel: z.enum(PAYMENT_CHANNELS, { errorMap: () => required }),
      kind: z.enum(PAYMENT_KINDS, { errorMap: () => required }),
      provider: z.union([z.enum(GATEWAY_PROVIDERS), z.literal("none")]).optional(),
      active: z.boolean(),
      position: z.coerce.number().int().min(0).max(9999),
      fee_percent: z.coerce.number().min(0, t("feePercent")).max(100, t("feePercent")),
      fee_fixed: z.coerce.number().min(0),
      min_amount: optionalMoney,
      max_amount: optionalMoney,
      requires_reference: z.boolean(),
      allows_change: z.boolean(),
    })
    .superRefine((values, ctx) => {
      if (!KIND_CHANNELS[values.kind].includes(values.channel)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["kind"], message: t("kindChannel") });
      }
      if (values.kind === "GATEWAY" && (!values.provider || values.provider === "none")) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["provider"], message: t("provider") });
      }
      if (values.allows_change && !KINDS_WITH_CHANGE.includes(values.kind)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["allows_change"], message: t("change") });
      }
      if (values.min_amount != null && values.max_amount != null && values.min_amount > values.max_amount) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["max_amount"], message: t("limits") });
      }
    });
};

export type PaymentMethodFormValues = z.infer<ReturnType<typeof validationPaymentMethod>>;
export type PaymentMethodFormInput = Omit<PaymentMethodFormValues, "min_amount" | "max_amount" | "position" | "fee_percent" | "fee_fixed"> & {
  min_amount?: number | string;
  max_amount?: number | string;
  position: number | string;
  fee_percent: number | string;
  fee_fixed: number | string;
};
