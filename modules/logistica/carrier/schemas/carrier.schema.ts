/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";

export const validationCarrier = () => {
  const intl = useTranslations("Form");

  return z.object({
    name: z.string().trim().min(1, { message: intl("requiredField") }),
    code: z.string().trim().min(1, { message: intl("requiredField") }),
    contactEmail: z.union([z.literal(""), z.string().trim().email({ message: intl("invalidEmail") })]).optional(),
    contactPhone: z.string().optional(),
    website: z.string().optional(),
    baseRate: z.coerce.number({ invalid_type_error: intl("requiredField") }).positive({ message: intl("positiveNumber") }),
    ratePerKm: z.coerce.number({ invalid_type_error: intl("requiredField") }).positive({ message: intl("positiveNumber") }),
    maxDeliveryDays: z.coerce.number({ invalid_type_error: intl("requiredField") }).int().min(1, { message: intl("requiredField") }),
    isActive: z.union([z.boolean(), z.enum(["true", "false"])]).transform((value) => value === true || value === "true"),
  });
};
