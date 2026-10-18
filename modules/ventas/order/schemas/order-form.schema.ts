/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;
const PHONE = /^$|^[+0-9()\s-]{7,20}$/;
const DOC = /^$|^[A-Za-z0-9.\-\s]{3,24}$/;
const MONEY = /^$|^\d+(\.\d{1,2})?$/;
const INT = /^\d+$/;

/**
 * Orden por secciones (alta y edición). Los números se manejan como texto en el
 * formulario y se convierten al enviar. `withLines` = alta (exige productos).
 */
export const validationOrderForm = (withLines: boolean) => {
  const intl = useTranslations("Form");
  const tv = useTranslations("Administre.order.validation");
  const max = (n: number) => z.string().trim().max(n, { message: intl("maxLength", { max: n }) });

  return z
    .object({
      customer_id: z.string(),
      customer_kind: z.string(),
      customer_doc_type: z.string(),
      customer_doc_number: max(30).regex(DOC, { message: tv("doc") }),
      customer_name: max(200),
      customer_email: max(160).refine((value) => value === "" || EMAIL.test(value), { message: intl("invalidEmail") }),
      customer_phone: max(40).regex(PHONE, { message: tv("phone") }),
      billing_address: max(200),
      billing_city: max(120),
      delivery_method: z.string(),
      pickup_store_id: z.string(),
      recipient_name: max(160),
      recipient_phone: max(40).regex(PHONE, { message: tv("phone") }),
      ship_address: max(200),
      ship_address_detail: max(200),
      ship_country_id: z.string(),
      ship_state_id: z.string(),
      ship_city_id: z.string(),
      ship_postal_code: max(20),
      delivery_notes: max(500),
      carrier_id: z.string(),
      shipping_amount: z.string().trim().regex(MONEY, { message: tv("money") }),
      promised_date: z.string(),
      channel: z.string(),
      store_id: z.string(),
      warehouse_id: z.string(),
      assigned_to: max(120),
      priority: z.string(),
      complementary_order: max(255),
      discount_type: z.string(),
      discount_value: z.string().trim().regex(MONEY, { message: tv("money") }),
      coupon_code: max(50),
      internal_notes: z.string().max(2000, { message: intl("maxLength", { max: 2000 }) }),
      customer_notes: z.string().max(2000, { message: intl("maxLength", { max: 2000 }) }),
      lines: z.array(
        z.object({
          sku_id: z.number(),
          product_id: z.number().optional(),
          label: z.string(),
          code: z.string(),
          unit_price: z.number(),
          available: z.number().optional(),
          quantity: z.string().trim().regex(INT, { message: tv("quantity") }),
          discount: z.string().trim().regex(MONEY, { message: tv("money") }),
        }),
      ),
    })
    .superRefine((form, ctx) => {
      const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: "custom", path, message });
      if (!form.customer_name.trim()) issue(["customer_name"], intl("requiredField"));
      if (!form.customer_email.trim() && !form.customer_phone.trim()) issue(["customer_phone"], tv("contact"));
      if (form.delivery_method === "PICKUP") {
        if (!form.pickup_store_id) issue(["pickup_store_id"], tv("pickupStore"));
      } else {
        if (!form.recipient_name.trim()) issue(["recipient_name"], intl("requiredField"));
        if (!form.ship_address.trim()) issue(["ship_address"], intl("requiredField"));
        if (!form.ship_city_id) issue(["ship_city_id"], tv("city"));
      }
      if (form.discount_type === "PERCENT" || form.discount_type === "AMOUNT") {
        const value = Number(form.discount_value || 0);
        if (!(value > 0)) issue(["discount_value"], tv("discountValue"));
        if (form.discount_type === "PERCENT" && value > 100) issue(["discount_value"], tv("percent"));
      }
      if (form.discount_type === "COUPON" && !form.coupon_code.trim()) issue(["coupon_code"], tv("coupon"));
      if (withLines && form.lines.length === 0) issue(["lines"], tv("lines"));
      form.lines.forEach((line, index) => {
        const quantity = Number(line.quantity || 0);
        if (quantity < 1) issue(["lines", index, "quantity"], tv("quantity"));
        if (Number(line.discount || 0) > line.unit_price * quantity) issue(["lines", index, "discount"], tv("lineDiscount"));
      });
    });
};

export type OrderFormValues = z.infer<ReturnType<typeof validationOrderForm>>;
export type OrderFormLine = OrderFormValues["lines"][number];
