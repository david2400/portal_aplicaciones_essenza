/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";

export const validationProduct = () => {
  const intl = useTranslations("Form");

  return z.object({
    name: z.string().trim().min(1, { message: intl("requiredField") }),
    supplierId: z.coerce.number({ invalid_type_error: intl("requiredField") }).int().positive({ message: intl("requiredField") }),
    brandId: z.coerce.number({ invalid_type_error: intl("requiredField") }).int().positive({ message: intl("requiredField") }),
    categoryId: z.coerce.number({ invalid_type_error: intl("requiredField") }).int().positive({ message: intl("requiredField") }),
    subcategoryId: z.coerce.number({ invalid_type_error: intl("requiredField") }).int().positive({ message: intl("requiredField") }),
    stock: z.coerce.number({ invalid_type_error: intl("requiredField") }).int().min(0, { message: intl("requiredField") }),
    realPrice: z.coerce.number({ invalid_type_error: intl("requiredField") }).min(0, { message: intl("requiredField") }),
    unitPrice: z.coerce.number({ invalid_type_error: intl("requiredField") }).min(0, { message: intl("requiredField") }),
    length: z.coerce.number({ invalid_type_error: intl("requiredField") }).min(0, { message: intl("requiredField") }),
    width: z.coerce.number({ invalid_type_error: intl("requiredField") }).min(0, { message: intl("requiredField") }),
    height: z.coerce.number({ invalid_type_error: intl("requiredField") }).min(0, { message: intl("requiredField") }),
    weight: z.coerce.number({ invalid_type_error: intl("requiredField") }).min(0, { message: intl("requiredField") }),
    imageUrl: z.string().optional(),
    available: z.union([z.boolean(), z.enum(["true", "false"])]).transform((value) => value === true || value === "true"),
    isCombo: z.union([z.boolean(), z.enum(["true", "false"])]).transform((value) => value === true || value === "true"),
    description: z.string().trim().min(1, { message: intl("requiredField") }),
  });
};
