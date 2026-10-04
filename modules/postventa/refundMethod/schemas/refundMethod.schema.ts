/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";

export const validationRefundMethod = () => {
  const intl = useTranslations("Form");

  return z.object({
    name: z.string().trim().min(1, { message: intl("requiredField") }),
    active: z.union([z.boolean(), z.enum(["true", "false"])]).transform((value) => value === true || value === "true"),
    description: z.string().optional(),
    policy: z.string().optional(),
  });
};
