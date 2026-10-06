/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";

/** Plantilla: nombre y atributos sin repetir; solo los de opciones pueden ser eje de variante. */
export const validationProductTemplate = (optionAttributeIds: Set<number>) => {
  const intl = useTranslations("Form");
  const t = useTranslations("Administre.productTemplate.validation");
  const required = { message: intl("requiredField") };

  return z
    .object({
      name: z.string().trim().min(1, required).max(120),
      description: z.string().trim().max(500).optional(),
      attributes: z
        .array(
          z.object({
            attribute_id: z.coerce.number({ invalid_type_error: intl("requiredField") }).int().positive(required),
            required: z.boolean().default(false),
            variant_axis: z.boolean().default(false),
            filterable: z.boolean().default(false),
          }),
        )
        .default([]),
    })
    .superRefine((values, ctx) => {
      const seen = new Set<number>();
      values.attributes.forEach((item, index) => {
        if (seen.has(item.attribute_id)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["attributes", index, "attribute_id"], message: t("duplicated") });
        }
        seen.add(item.attribute_id);
        if (item.variant_axis && !optionAttributeIds.has(item.attribute_id)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["attributes", index, "attribute_id"], message: t("axisOnlyOption") });
        }
      });
    });
};

export type ProductTemplateFormValues = z.infer<ReturnType<typeof validationProductTemplate>>;
