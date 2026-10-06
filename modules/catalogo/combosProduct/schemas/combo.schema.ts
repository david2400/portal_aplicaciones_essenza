/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";

export const validationCombo = () => {
  const intl = useTranslations("Form");

  return z.object({
    combo_id: z.coerce.number({ invalid_type_error: intl("requiredField") }).int().positive({ message: intl("requiredField") }),
    product_id: z.coerce.number({ invalid_type_error: intl("requiredField") }).int().positive({ message: intl("requiredField") }),
    quantity: z.coerce.number({ invalid_type_error: intl("requiredField") }).int().min(1, { message: intl("requiredField") }),
  });
};
