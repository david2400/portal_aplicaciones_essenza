/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";

/** El backend exige `> 0` en peso y volumen cuando se envían. */
const optionalPositive = () =>
  z
    .union([z.literal(""), z.coerce.number().positive()])
    .optional()
    .transform((value) => (value === "" || value == null ? undefined : value));

export const validationShippingCost = () => {
  const intl = useTranslations("Form");

  return z.object({
    carrierId: z.coerce
      .number({ invalid_type_error: intl("requiredField") })
      .int()
      .positive({ message: intl("requiredField") }),
    originAddress: z.string().trim().min(1, { message: intl("requiredField") }),
    destinationAddress: z.string().trim().min(1, { message: intl("requiredField") }),
    weight: optionalPositive(),
    volume: optionalPositive(),
  });
};

export type ShippingCostFormValues = z.infer<ReturnType<typeof validationShippingCost>>;
