/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";
import { OPENING_MODES, RECEIPT_WIDTHS } from "../models/cash.interface";

const CODE = /^[A-Z][A-Z0-9_]{1,29}$/;

/** "12.5" | "" → número | null; texto inválido → NaN. */
export const toAmount = (value?: string | null) => {
  if (value == null || value.trim() === "") return null;
  const number = Number(value.replace(",", "."));
  return Number.isFinite(number) ? number : Number.NaN;
};

export const validationStore = () => {
  const intl = useTranslations("Form");
  const t = useTranslations("Administre.cash.store.form");
  const tStore = useTranslations("Administre.cash.store.form");
  return z.object({
    name: z.string().trim().min(1, { message: intl("requiredField") }).max(120, { message: intl("maxLength", { max: 120 }) }),
    code: z.string().trim().regex(CODE, { message: t("codeInvalid") }),
    address: z.string().trim().max(200, { message: intl("maxLength", { max: 200 }) }),
    phone: z.string().trim().max(40, { message: intl("maxLength", { max: 40 }) }),
    email: z
      .string()
      .trim()
      .max(120)
      .refine((value) => value === "" || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value), { message: intl("invalidEmail") }),
    warehouse_id: z.string().min(1, { message: t("warehouseRequired") }),
    opening_hours: z.string().trim().max(255, { message: intl("maxLength", { max: 255 }) }),
    ticket_header: z.string().max(500, { message: intl("maxLength", { max: 500 }) }),
    ticket_footer: z.string().max(500, { message: intl("maxLength", { max: 500 }) }),
    active: z.boolean(),
    // Ubicación del catálogo del servicio parametros (valores del select como string).
    country_id: z.string(),
    state_id: z.string(),
    city_id: z.string(),
  })
    .superRefine((form, ctx) => {
      if (form.country_id && !form.state_id) {
        ctx.addIssue({ code: "custom", path: ["state_id"], message: tStore("stateRequired") });
      }
      if (form.state_id && !form.city_id) {
        ctx.addIssue({ code: "custom", path: ["city_id"], message: tStore("cityRequired") });
      }
    });
};

export const validationCashRegister = () => {
  const intl = useTranslations("Form");
  const t = useTranslations("Administre.cash.register.form");
  return z
    .object({
      name: z.string().trim().min(1, { message: intl("requiredField") }).max(120, { message: intl("maxLength", { max: 120 }) }),
      code: z.string().trim().regex(CODE, { message: t("codeInvalid") }),
      store_id: z.string().min(1, { message: t("storeRequired") }),
      location: z.string().trim().max(160, { message: intl("maxLength", { max: 160 }) }),
      device_name: z.string().trim().max(80, { message: intl("maxLength", { max: 80 }) }),
      warehouse_id: z.string(),
      restrict_methods: z.boolean(),
      allowed_method_ids: z.array(z.number()),
      opening_mode: z.enum(OPENING_MODES),
      default_opening_amount: z.string(),
      cash_limit: z.string(),
      blind_close: z.boolean(),
      difference_tolerance: z.string(),
      max_discount_percent: z.string(),
      auto_invoice: z.boolean(),
      receipt_width: z.enum(RECEIPT_WIDTHS),
      active: z.boolean(),
    })
    .superRefine((form, ctx) => {
      const amount = (field: "default_opening_amount" | "cash_limit" | "difference_tolerance" | "max_discount_percent") => {
        const value = toAmount(form[field]);
        if (value != null && (Number.isNaN(value) || value < 0)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field], message: t("invalidAmount") });
          return null;
        }
        return value;
      };
      const base = amount("default_opening_amount");
      const limit = amount("cash_limit");
      amount("difference_tolerance");
      const discount = amount("max_discount_percent");
      if (form.opening_mode !== "FREE" && base == null) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["default_opening_amount"], message: t("baseRequired") });
      }
      if (limit != null && limit <= (base ?? 0)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["cash_limit"], message: t("limitAboveBase") });
      }
      if (discount != null && discount > 100) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["max_discount_percent"], message: intl("range", { min: 0, max: 100 }) });
      }
      if (form.restrict_methods && form.allowed_method_ids.length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["allowed_method_ids"], message: t("methodsRequired") });
      }
    });
};

export type StoreFormValues = z.infer<ReturnType<typeof validationStore>>;
export type CashRegisterFormValues = z.infer<ReturnType<typeof validationCashRegister>>;
