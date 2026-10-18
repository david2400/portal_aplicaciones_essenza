/** @format */

import { z } from "zod";

const optionalNumber = z.preprocess(
  (value) => (value === "" || value == null ? undefined : value),
  z.coerce.number().min(0).optional(),
);

/**
 * Cobro de una orden. `gateway` (pasarela) no pide referencia ni efectivo recibido;
 * las reglas finas (saldo, límites, referencia obligatoria, cambio) las valida el backend.
 */
export interface RegisterPaymentRules {
  collectable: number;
  requiresReference: boolean;
  allowsChange: boolean;
  gateway: boolean;
}

/** Textos de validación (se pasan ya traducidos: el esquema cambia con el medio elegido). */
export interface RegisterPaymentMessages {
  required: string;
  email: string;
  amount: string;
  overBalance: string;
  reference: string;
  tenderedLow: string;
  noChange: string;
}

export const buildRegisterPaymentSchema = (rules: RegisterPaymentRules, m: RegisterPaymentMessages) => {

  return z
    .object({
      payment_method_id: z.string().min(1, m.required),
      amount: optionalNumber,
      tendered_amount: optionalNumber,
      reference: z.string().trim().max(120).optional(),
      notes: z.string().trim().max(500).optional(),
      pending: z.boolean(),
      payer_email: z
        .string()
        .trim()
        .email(m.email)
        .optional()
        .or(z.literal("")),
    })
    .superRefine((values, ctx) => {
      const amount = values.amount;
      if (!rules.gateway && (amount == null || amount <= 0)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["amount"], message: m.amount });
      }
      if (amount != null && amount > rules.collectable + 0.005) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["amount"], message: m.overBalance });
      }
      if (!rules.gateway && rules.requiresReference && !values.reference) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["reference"], message: m.reference });
      }
      if (values.tendered_amount != null && amount != null) {
        if (values.tendered_amount < amount) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["tendered_amount"], message: m.tenderedLow });
        } else if (!rules.allowsChange && values.tendered_amount !== amount) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["tendered_amount"], message: m.noChange });
        }
      }
    });
};

export type RegisterPaymentFormValues = z.infer<ReturnType<typeof buildRegisterPaymentSchema>>;
export type RegisterPaymentFormInput = Omit<RegisterPaymentFormValues, "amount" | "tendered_amount"> & {
  amount?: number | string;
  tendered_amount?: number | string;
};
