/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";

export const validationCategory = () => {
  const intl = useTranslations("Form");

  return z.object({
    name: z.string().trim().min(1, { message: intl("requiredField") }),
    slug: z.string().trim().min(1, { message: intl("requiredField") }),
    description: z.string().optional(),
  });
};
