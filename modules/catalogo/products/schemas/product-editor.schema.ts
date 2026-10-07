/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";

const bool = z.union([z.boolean(), z.enum(["true", "false"])]).transform((value) => value === true || value === "true");

/** Variante del producto (el producto lo fija el editor). Refleja CreateProductChildDto. */
export const validationVariant = () => {
  const intl = useTranslations("Form");
  const t = useTranslations("Administre.productChild.validation");
  const required = { message: intl("requiredField") };

  return z
    .object({
    name: z.string().trim().min(1, required).max(255),
    description: z.string().max(1000).optional(),
    stock: z.coerce.number({ invalid_type_error: intl("requiredField") }).int(t("stockInteger")).min(0, t("stockMin")),
    unit_price: z.coerce.number({ invalid_type_error: intl("requiredField") }).positive(t("pricePositive")),
    image_url: z
      .string()
      .trim()
      .max(500)
      .refine((value) => value === "" || /^https?:\/\/\S+$/i.test(value), t("imageUrl"))
      .optional(),
    available: bool,
    net_content: z.preprocess(
      (value) => (value === "" || value == null ? undefined : value),
      z.coerce.number().positive(t("netContentPositive")).optional(),
    ),
    net_content_unit_id: z.string().optional(),
  })
    .superRefine((values, ctx) => {
      const hasUnit = Boolean(values.net_content_unit_id && values.net_content_unit_id !== "none");
      if (values.net_content != null && !hasUnit) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["net_content_unit_id"], message: t("netContentUnitRequired") });
      }
      if (values.net_content == null && hasUnit) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["net_content"], message: t("netContentValueRequired") });
      }
    });
};
export type VariantFormValues = z.infer<ReturnType<typeof validationVariant>>;

/** Componente del combo: producto y cantidad. */
export const validationComboItem = () => {
  const intl = useTranslations("Form");
  return z.object({
    product_id: z.coerce.number({ invalid_type_error: intl("requiredField") }).int().positive({ message: intl("requiredField") }),
    quantity: z.coerce.number({ invalid_type_error: intl("requiredField") }).int().min(1, { message: intl("requiredField") }),
  });
};
export type ComboItemFormValues = z.infer<ReturnType<typeof validationComboItem>>;

/** URL de imagen http(s). */
export const IMAGE_URL = /^https?:\/\/\S+$/i;
