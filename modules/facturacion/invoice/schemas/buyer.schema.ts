/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";
import { BUYER_DOC_TYPES } from "../models/invoice.interface";

/** Comprador de la factura: consumidor final o con datos (documento, nombre, correo…). */
export const validationBuyer = () => {
  const intl = useTranslations("Form");
  const t = useTranslations("Administre.billing.invoice.validation");
  const required = intl("requiredField");

  return z
    .object({
      final_consumer: z.boolean(),
      doc_type: z.enum(BUYER_DOC_TYPES),
      doc_number: z.string().trim().max(20).optional(),
      name: z.string().trim().max(200).optional(),
      email: z.string().trim().email(t("email")).optional().or(z.literal("")),
      phone: z.string().trim().max(40).optional(),
      address: z.string().trim().max(200).optional(),
      city: z.string().trim().max(120).optional(),
    })
    .superRefine((values, ctx) => {
      if (values.final_consumer) return;
      if (!values.doc_number) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["doc_number"], message: required });
      else if (["CC", "NIT", "TI"].includes(values.doc_type) && !/^[\d.\-\s]+$/.test(values.doc_number)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["doc_number"], message: t("digits") });
      }
      if (!values.name) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["name"], message: required });
    });
};

export type BuyerFormValues = z.infer<ReturnType<typeof validationBuyer>>;

/** Dígito de verificación del NIT (módulo 11 de la DIAN), para mostrarlo mientras se escribe. */
export const nitCheckDigit = (nit: string) => {
  const digits = nit.replace(/\D/g, "");
  if (!digits) return "";
  const weights = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
  if (digits.length > weights.length) return "";
  let sum = 0;
  for (let i = 0; i < digits.length; i++) sum += Number(digits[digits.length - 1 - i]) * (weights[i] ?? 0);
  const remainder = sum % 11;
  return String(remainder > 1 ? 11 - remainder : remainder);
};
