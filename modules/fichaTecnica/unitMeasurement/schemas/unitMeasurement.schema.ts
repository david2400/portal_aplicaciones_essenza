/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";
import { UNIT_DIMENSIONS } from "@/shared/units/units";

const bool = z.union([z.boolean(), z.enum(["true", "false"])]).transform((value) => value === true || value === "true");

/** Refleja SaveUnitDto y las reglas de UnitOfMeasure del backend. */
export const validationUnitMeasurement = () => {
  const intl = useTranslations("Form");
  const t = useTranslations("Administre.unitMeasurement.validation");

  return z
    .object({
      name: z.string().trim().min(1, intl("requiredField")).max(255),
      symbol: z.string().trim().min(1, intl("requiredField")).max(20),
      code: z
        .string()
        .trim()
        .max(20)
        .regex(/^[a-z0-9_]*$/, t("code"))
        .optional(),
      dimension: z.enum(UNIT_DIMENSIONS),
      factor: z.preprocess(
        (value) => (value === "" || value == null ? undefined : value),
        z.coerce.number({ invalid_type_error: t("factor") }).positive(t("factor")).optional(),
      ),
      base: bool,
      decimals: z.coerce.number().int().min(0).max(6),
      active: bool,
    })
    .superRefine((values, ctx) => {
      if (values.dimension !== "OTHER" && !values.base && values.factor == null) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["factor"], message: t("factor") });
      }
      if (values.base && !values.active) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["active"], message: t("baseActive") });
      }
    });
};

export type UnitFormValues = z.infer<ReturnType<typeof validationUnitMeasurement>>;
