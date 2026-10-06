/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";
import { DISCOUNT_TYPES } from "../models/coupon.interface";

/** Refleja las validaciones de CreateCouponDto del backend. */
export const validationCoupon = () => {
  const intl = useTranslations("Form");
  const t = useTranslations("Administre.coupon.validation");
  const required = { message: intl("requiredField") };
  const optionalNumber = (min: number) =>
    z.preprocess(
      (value) => (value === "" || value == null ? undefined : value),
      z.coerce.number().min(min).optional(),
    );
  const bool = z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((value) => value === true || value === "true");

  return z
    .object({
      code: z
        .string()
        .trim()
        .transform((value) => value.toUpperCase())
        .pipe(z.string().min(3, t("codeLength")).max(50, t("codeLength")).regex(/^[A-Z0-9_-]+$/, t("codeFormat"))),
      name: z.string().trim().min(1, required).max(255),
      description: z.string().max(1000).optional(),
      discount_type: z.enum(DISCOUNT_TYPES, { errorMap: () => required }),
      discount_value: z.coerce.number({ invalid_type_error: intl("requiredField") }).min(0.01, t("discountPositive")),
      minimum_order_amount: optionalNumber(0),
      maximum_discount_amount: optionalNumber(0),
      usage_limit: z.preprocess(
        (value) => (value === "" || value == null ? undefined : value),
        z.coerce.number().int().min(1, t("usageLimit")).optional(),
      ),
      valid_from: z.string().min(1, required),
      valid_until: z.string().min(1, required),
      is_active: bool,
      is_public: bool,
      applicable_categories: z.array(z.string()).optional(),
      applicable_products: z.array(z.string()).optional(),
      excluded_categories: z.array(z.string()).optional(),
      excluded_products: z.array(z.string()).optional(),
    })
    .superRefine((values, ctx) => {
      if (values.discount_type === "PERCENTAGE" && values.discount_value > 100) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["discount_value"], message: t("percentageMax") });
      }
      if (values.valid_from && values.valid_until && values.valid_until <= values.valid_from) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["valid_until"], message: t("dateRange") });
      }
    });
};
