/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";
import { onlyDigits } from "@/lib/tax-id";

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const CODE = /^$|^[A-Za-z][A-Za-z0-9_]{1,29}$/;
const MONEY = /^$|^\d+(\.\d{1,2})?$/;
const INT = /^$|^\d+$/;

/**
 * Ficha del proveedor. Los valores numéricos se manejan como texto en el
 * formulario (inputs y selects) y se convierten al enviar.
 */
export const validationSupplier = () => {
  const intl = useTranslations("Form");
  const tv = useTranslations("Administre.supplier.validation");
  const email = z
    .string()
    .trim()
    .max(120, { message: intl("maxLength", { max: 120 }) })
    .refine((value) => value === "" || EMAIL.test(value), { message: intl("invalidEmail") });

  return z
    .object({
      code: z.string().trim().regex(CODE, { message: tv("code") }),
      doc_type: z.string().min(1, { message: intl("requiredField") }),
      doc_number: z.string().trim().min(1, { message: intl("requiredField") }).max(20, { message: intl("maxLength", { max: 20 }) }),
      person_type: z.string(),
      name: z.string().trim().min(1, { message: intl("requiredField") }).max(255, { message: intl("maxLength", { max: 255 }) }),
      trade_name: z.string().trim().max(160, { message: intl("maxLength", { max: 160 }) }),
      tax_regime: z.string(),
      great_contributor: z.boolean(),
      self_retainer: z.boolean(),
      email,
      phone: z.string().trim().max(40, { message: intl("maxLength", { max: 40 }) }),
      website: z.string().trim().max(160, { message: intl("maxLength", { max: 160 }) }),
      address: z.string().trim().max(255, { message: intl("maxLength", { max: 255 }) }),
      country_id: z.string(),
      state_id: z.string(),
      city_id: z.string(),
      payment_term_days: z.string().regex(INT, { message: tv("integer") }),
      credit_limit: z.string().trim().regex(MONEY, { message: tv("money") }),
      currency: z.string(),
      lead_time_days: z.string().trim().regex(INT, { message: tv("integer") }),
      min_order_amount: z.string().trim().regex(MONEY, { message: tv("money") }),
      discount_percent: z.string().trim().regex(MONEY, { message: tv("money") }),
      bank_name: z.string().trim().max(80, { message: intl("maxLength", { max: 80 }) }),
      bank_account_type: z.string(),
      bank_account_number: z.string().trim().max(30, { message: intl("maxLength", { max: 30 }) }),
      bank_account_holder: z.string().trim().max(160, { message: intl("maxLength", { max: 160 }) }),
      bank_holder_document: z.string().trim().max(20, { message: intl("maxLength", { max: 20 }) }),
      notes: z.string().max(1000, { message: intl("maxLength", { max: 1000 }) }),
      contacts: z
        .array(
          z.object({
            name: z.string().trim().min(1, { message: intl("requiredField") }).max(120),
            position: z.string().trim().max(80),
            area: z.string(),
            phone: z.string().trim().max(40),
            email,
            primary: z.boolean(),
          }),
        )
        .max(20),
    })
    .superRefine((form, ctx) => {
      const issue = (path: string, message: string) => ctx.addIssue({ code: "custom", path: [path], message });
      if ((form.doc_type === "NIT" || form.doc_type === "CC") && !/^\d{5,15}$/.test(onlyDigits(form.doc_number))) {
        issue("doc_number", tv("docDigits"));
      }
      if (form.person_type === "JURIDICA" && form.doc_type !== "NIT" && form.doc_type !== "NIT_EXT") {
        issue("person_type", tv("legalNeedsNit"));
      }
      if (form.country_id && !form.state_id) issue("state_id", tv("stateRequired"));
      if (form.state_id && !form.city_id) issue("city_id", tv("cityRequired"));
      if (Number(form.payment_term_days || 0) > 365) issue("payment_term_days", tv("term"));
      if (Number(form.payment_term_days || 0) === 0 && Number(form.credit_limit || 0) > 0) issue("credit_limit", tv("cashNoCredit"));
      if (Number(form.discount_percent || 0) > 100) issue("discount_percent", tv("percent"));
      if (Number(form.lead_time_days || 0) > 365) issue("lead_time_days", tv("term"));
      const bankAny = [form.bank_name, form.bank_account_type, form.bank_account_number, form.bank_account_holder, form.bank_holder_document].some(Boolean);
      if (bankAny) {
        if (!form.bank_name) issue("bank_name", tv("bankComplete"));
        if (!form.bank_account_type) issue("bank_account_type", tv("bankComplete"));
        if (!/^\d{6,20}$/.test(form.bank_account_number.replace(/[\s-]/g, ""))) issue("bank_account_number", tv("bankNumber"));
      }
      if (form.contacts.filter((contact) => contact.primary).length > 1) issue("contacts", tv("onePrimary"));
      form.contacts.forEach((contact, index) => {
        if (!contact.phone && !contact.email) {
          ctx.addIssue({ code: "custom", path: ["contacts", index, "phone"], message: tv("contactReach") });
        }
      });
    });
};

export type SupplierFormValues = z.infer<ReturnType<typeof validationSupplier>>;

export const validationSupplierProduct = () => {
  const intl = useTranslations("Form");
  const tv = useTranslations("Administre.supplier.validation");
  return z.object({
    sku_id: z.string().min(1, { message: intl("requiredField") }),
    supplier_code: z.string().trim().max(64, { message: intl("maxLength", { max: 64 }) }),
    unit_cost: z.string().trim().min(1, { message: intl("requiredField") }).regex(MONEY, { message: tv("money") }),
    lead_time_days: z.string().trim().regex(INT, { message: tv("integer") }),
    min_order_qty: z
      .string()
      .trim()
      .regex(/^[1-9]\d*$/, { message: tv("minQty") }),
    preferred: z.boolean(),
    active: z.boolean(),
  });
};

export type SupplierProductFormValues = z.infer<ReturnType<typeof validationSupplierProduct>>;
