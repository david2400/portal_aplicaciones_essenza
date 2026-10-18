/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";

export const validationOrderItem = () => {
  const intl = useTranslations("Form");
  const number = () => z.coerce.number({ invalid_type_error: intl("requiredField") });

  return z.object({
    sku_id: number().int().positive({ message: intl("requiredField") }),
    quantity: number().int().min(1, { message: intl("requiredField") }),
    discount: number().min(0, { message: intl("requiredField") }),
  });
};
