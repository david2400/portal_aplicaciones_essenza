/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";
import { PRODUCT_STATUSES } from "../models/product.interface";

export const validationProduct = () => {
  const intl = useTranslations("Form");
  const t = useTranslations("Administre.product");

  return z
    .object({
    name: z.string().trim().min(1, { message: intl("requiredField") }),
    supplier_id: z.coerce.number({ invalid_type_error: intl("requiredField") }).int().positive({ message: intl("requiredField") }),
    brand_id: z.coerce.number({ invalid_type_error: intl("requiredField") }).int().positive({ message: intl("requiredField") }),
    category_id: z.coerce.number({ invalid_type_error: intl("requiredField") }).int().positive({ message: intl("requiredField") }),
    subcategory_id: z.coerce.number({ invalid_type_error: intl("requiredField") }).int().positive({ message: intl("requiredField") }),
    stock: z.coerce.number({ invalid_type_error: intl("requiredField") }).int().min(0, { message: intl("requiredField") }),
    real_price: z.coerce.number({ invalid_type_error: intl("requiredField") }).min(0, { message: intl("requiredField") }),
    unit_price: z.coerce.number({ invalid_type_error: intl("requiredField") }).min(0, { message: intl("requiredField") }),
    length: z.coerce.number({ invalid_type_error: intl("requiredField") }).min(0, { message: intl("requiredField") }),
    width: z.coerce.number({ invalid_type_error: intl("requiredField") }).min(0, { message: intl("requiredField") }),
    height: z.coerce.number({ invalid_type_error: intl("requiredField") }).min(0, { message: intl("requiredField") }),
    weight: z.coerce.number({ invalid_type_error: intl("requiredField") }).min(0, { message: intl("requiredField") }),
    image_url: z.string().optional(),
    status: z.enum(PRODUCT_STATUSES),
    slug: z
      .string()
      .trim()
      .max(180)
      .regex(/^[a-z0-9-]*$/, { message: t("slugFormat") })
      .optional(),
    is_combo: z.union([z.boolean(), z.enum(["true", "false"])]).transform((value) => value === true || value === "true"),
    description: z.string().trim().min(1, { message: intl("requiredField") }),
    net_content: z.preprocess(
      (value) => (value === "" || value == null ? undefined : value),
      z.coerce.number().positive({ message: t("netContentPositive") }).optional(),
    ),
    net_content_unit_id: z.union([z.string(), z.number()]).optional(),
  })
    .superRefine((values, ctx) => {
      const hasUnit = values.net_content_unit_id != null && values.net_content_unit_id !== "" && values.net_content_unit_id !== "none";
      if (values.net_content != null && !hasUnit) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["net_content_unit_id"], message: t("netContentUnitRequired") });
      }
      if (values.net_content == null && hasUnit) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["net_content"], message: t("netContentValueRequired") });
      }
    });
};
