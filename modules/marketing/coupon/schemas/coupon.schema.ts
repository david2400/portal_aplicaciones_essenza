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
      discountType: z.enum(DISCOUNT_TYPES, { errorMap: () => required }),
      discountValue: z.coerce.number({ invalid_type_error: intl("requiredField") }).min(0.01, t("discountPositive")),
      minimumOrderAmount: optionalNumber(0),
      maximumDiscountAmount: optionalNumber(0),
      usageLimit: z.preprocess(
        (value) => (value === "" || value == null ? undefined : value),
        z.coerce.number().int().min(1, t("usageLimit")).optional(),
      ),
      validFrom: z.string().min(1, required),
      validUntil: z.string().min(1, required),
      isActive: bool,
      isPublic: bool,
      applicableCategories: z.array(z.string()).optional(),
      applicableProducts: z.array(z.string()).optional(),
      excludedCategories: z.array(z.string()).optional(),
      excludedProducts: z.array(z.string()).optional(),
    })
    .superRefine((values, ctx) => {
      if (values.discountType === "PERCENTAGE" && values.discountValue > 100) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["discountValue"], message: t("percentageMax") });
      }
      if (values.validFrom && values.validUntil && values.validUntil <= values.validFrom) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["validUntil"], message: t("dateRange") });
      }
    });
};
