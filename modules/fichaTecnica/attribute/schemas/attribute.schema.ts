/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";
import { ATTRIBUTE_DATA_TYPES } from "../models/attribute.interface";

/** Refleja las reglas del backend: código, tipo y opciones (solo OPTION, sin repetir). */
export const validationAttribute = () => {
  const intl = useTranslations("Form");
  const t = useTranslations("Administre.attribute.validation");
  const required = { message: intl("requiredField") };
  const optionalId = z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().int().positive().optional(),
  );

  return z
    .object({
      code: z
        .string()
        .trim()
        .regex(/^[a-z][a-z0-9_]{1,59}$/, t("code")),
      name: z.string().trim().min(1, required).max(120),
      description: z.string().trim().max(500).optional(),
      data_type: z.enum(ATTRIBUTE_DATA_TYPES, { errorMap: () => required }),
      unit_id: optionalId,
      options: z
        .array(z.object({ id: optionalId, value: z.string().trim().max(120) }))
        .default([]),
    })
    .superRefine((values, ctx) => {
      if (values.data_type !== "OPTION") return;
      const filled = values.options.filter((option) => option.value !== "");
      if (filled.length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["options"], message: t("optionsRequired") });
      }
      const seen = new Set<string>();
      values.options.forEach((option, index) => {
        const key = option.value.toLocaleLowerCase("es");
        if (option.value !== "" && seen.has(key)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["options", index, "value"], message: t("optionDuplicated") });
        }
        seen.add(key);
      });
    });
};

export type AttributeFormValues = z.infer<ReturnType<typeof validationAttribute>>;
