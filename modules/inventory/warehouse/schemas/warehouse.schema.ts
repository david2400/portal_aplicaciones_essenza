/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const CODE = /^$|^[A-Za-z0-9][A-Za-z0-9_.-]{0,49}$/;
const DECIMAL = /^$|^\d+(\.\d{1,2})?$/;
const INT = /^$|^\d+$/;

/** Ficha de la bodega. Números como texto en el formulario; se convierten al enviar. */
export const validationWarehouse = () => {
  const intl = useTranslations("Form");
  const tv = useTranslations("Administre.warehouse.validation");
  return z
    .object({
      name: z.string().trim().min(1, { message: intl("requiredField") }).max(150, { message: intl("maxLength", { max: 150 }) }),
      code: z.string().trim().regex(CODE, { message: tv("code") }),
      warehouse_type: z.string().min(1, { message: intl("requiredField") }),
      active: z.boolean(),
      allow_sales: z.boolean(),
      allow_online: z.boolean(),
      allow_receiving: z.boolean(),
      fulfillment_priority: z.string().regex(/^([1-9]|[1-9]\d)$/, { message: tv("priority") }),
      address: z.string().trim().max(255, { message: intl("maxLength", { max: 255 }) }),
      country_id: z.string(),
      state_id: z.string(),
      city_id: z.string(),
      manager_name: z.string().trim().max(120, { message: intl("maxLength", { max: 120 }) }),
      manager_phone: z.string().trim().max(40, { message: intl("maxLength", { max: 40 }) }),
      manager_email: z
        .string()
        .trim()
        .max(120, { message: intl("maxLength", { max: 120 }) })
        .refine((value) => value === "" || EMAIL.test(value), { message: intl("invalidEmail") }),
      opening_hours: z.string().trim().max(255, { message: intl("maxLength", { max: 255 }) }),
      notes: z.string().max(1000, { message: intl("maxLength", { max: 1000 }) }),
      area_m2: z.string().trim().regex(DECIMAL, { message: tv("number") }),
      capacity_units: z.string().trim().regex(INT, { message: tv("integer") }),
      capacity_positions: z.string().trim().regex(INT, { message: tv("integer") }),
    })
    .superRefine((form, ctx) => {
      const issue = (path: string, message: string) => ctx.addIssue({ code: "custom", path: [path], message });
      if (form.warehouse_type === "TRANSITO" && form.allow_sales) issue("allow_sales", tv("transitSales"));
      if (form.country_id && !form.state_id) issue("state_id", tv("stateRequired"));
      if (form.state_id && !form.city_id) issue("city_id", tv("cityRequired"));
      for (const field of ["area_m2", "capacity_units", "capacity_positions"] as const) {
        if (form[field] !== "" && Number(form[field]) <= 0) issue(field, tv("positive"));
      }
    });
};

export type WarehouseFormValues = z.infer<ReturnType<typeof validationWarehouse>>;

export const validationLocation = () => {
  const intl = useTranslations("Form");
  const tv = useTranslations("Administre.warehouse.validation");
  const part = (max: number) => z.string().trim().max(max, { message: intl("maxLength", { max }) });
  return z
    .object({
      code: z
        .string()
        .trim()
        .regex(/^$|^[A-Za-z0-9][A-Za-z0-9_.-]{0,29}$/, { message: tv("locationCode") }),
      zone: part(30),
      aisle: part(10),
      rack: part(10),
      level: part(10),
      location_type: z.string(),
      capacity_units: z.string().trim().regex(INT, { message: tv("integer") }),
      active: z.boolean(),
    })
    .superRefine((form, ctx) => {
      if (!form.code && !form.zone) ctx.addIssue({ code: "custom", path: ["zone"], message: tv("locationZone") });
      if (form.capacity_units !== "" && Number(form.capacity_units) <= 0) {
        ctx.addIssue({ code: "custom", path: ["capacity_units"], message: tv("positive") });
      }
    });
};

export type LocationFormValues = z.infer<ReturnType<typeof validationLocation>>;
