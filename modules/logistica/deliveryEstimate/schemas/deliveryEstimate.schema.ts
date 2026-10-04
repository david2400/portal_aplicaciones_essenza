/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";

export const validationDeliveryEstimate = () => {
  const intl = useTranslations("Form");

  return z.object({
    carrierId: z.coerce
      .number({ invalid_type_error: intl("requiredField") })
      .int()
      .positive({ message: intl("requiredField") }),
    originAddress: z.string().trim().min(1, { message: intl("requiredField") }),
    destinationAddress: z.string().trim().min(1, { message: intl("requiredField") }),
    /** Valor de `<input type="datetime-local">` (YYYY-MM-DDTHH:mm). */
    shipmentDate: z.string().trim().min(1, { message: intl("requiredField") }),
    isBusinessDaysOnly: z
      .union([z.boolean(), z.enum(["true", "false"])])
      .transform((value) => value === true || value === "true"),
  });
};

export type DeliveryEstimateFormValues = z.infer<ReturnType<typeof validationDeliveryEstimate>>;
