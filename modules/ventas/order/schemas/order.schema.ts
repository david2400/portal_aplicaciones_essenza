/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";
import { ORDER_STATES } from "../constants";

export const validationOrder = () => {
  const intl = useTranslations("Form");

  return z.object({
    complementaryOrder: z.string().optional(),
    total: z.coerce
      .number({ invalid_type_error: intl("requiredField") })
      .min(0, { message: intl("requiredField") }),
    state: z.enum(ORDER_STATES, { errorMap: () => ({ message: intl("requiredField") }) }),
  });
};

export const validationOrderItem = () => {
  const intl = useTranslations("Form");
  const number = () => z.coerce.number({ invalid_type_error: intl("requiredField") });

  return z.object({
    productId: number().int().positive({ message: intl("requiredField") }),
    quantity: number().int().min(1, { message: intl("requiredField") }),
    discount: number().min(0, { message: intl("requiredField") }),
  });
};
