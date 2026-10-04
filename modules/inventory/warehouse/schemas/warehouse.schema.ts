/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";

export const validationWarehouse = () => {
  const intl = useTranslations("Form");

  return z.object({
    name: z.string().trim().min(1, { message: intl("requiredField") }),
    code: z.string().trim().min(1, { message: intl("requiredField") }),
    address: z.string().optional(),
    active: z.union([z.boolean(), z.enum(["true", "false"])]).transform((value) => value === true || value === "true"),
  });
};
