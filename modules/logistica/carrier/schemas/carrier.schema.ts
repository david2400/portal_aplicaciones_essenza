/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";

export const validationCarrier = () => {
  const intl = useTranslations("Form");

  return z.object({
    name: z.string().trim().min(1, { message: intl("requiredField") }),
    code: z.string().trim().min(1, { message: intl("requiredField") }),
    contact_email: z.union([z.literal(""), z.string().trim().email({ message: intl("invalidEmail") })]).optional(),
    contact_phone: z.string().optional(),
    website: z.string().optional(),
    base_rate: z.coerce.number({ invalid_type_error: intl("requiredField") }).positive({ message: intl("positiveNumber") }),
    rate_per_km: z.coerce.number({ invalid_type_error: intl("requiredField") }).positive({ message: intl("positiveNumber") }),
    max_delivery_days: z.coerce.number({ invalid_type_error: intl("requiredField") }).int().min(1, { message: intl("requiredField") }),
    is_active: z.union([z.boolean(), z.enum(["true", "false"])]).transform((value) => value === true || value === "true"),
  });
};
