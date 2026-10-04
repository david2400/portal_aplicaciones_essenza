/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";

export const validationSupplier = () => {
  const intl = useTranslations("Form");

  return z.object({
    name: z.string().trim().min(1, { message: intl("requiredField") }),
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  });
};
