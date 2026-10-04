/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";

export const validationFeature = () => {
  const intl = useTranslations("Form");

  return z.object({
    name: z.string().trim().min(1, { message: intl("requiredField") }),
    unitId: z.coerce.number({ invalid_type_error: intl("requiredField") }).int().positive({ message: intl("requiredField") }),
  });
};
