/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";

/** Refleja las validaciones de CreateProductChildDto del backend. */
export const validationProductChild = () => {
  const intl = useTranslations("Form");
  const t = useTranslations("Administre.productChild.validation");
  const required = { message: intl("requiredField") };
  const bool = z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((value) => value === true || value === "true");

  return z.object({
    product_id: z.coerce.number({ invalid_type_error: intl("requiredField") }).int().positive(required.message),
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
  });
};

export type ProductChildFormValues = z.infer<ReturnType<typeof validationProductChild>>;
