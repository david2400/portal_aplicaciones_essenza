/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";

export const validationDeliveryEstimate = () => {
  const intl = useTranslations("Form");

  return z.object({
    carrier_id: z.coerce
      .number({ invalid_type_error: intl("requiredField") })
      .int()
      .positive({ message: intl("requiredField") }),
    origin_address: z.string().trim().min(1, { message: intl("requiredField") }),
    destination_address: z.string().trim().min(1, { message: intl("requiredField") }),
    /** Valor de `<input type="datetime-local">` (YYYY-MM-DDTHH:mm). */
    shipment_date: z.string().trim().min(1, { message: intl("requiredField") }),
    is_business_days_only: z
      .union([z.boolean(), z.enum(["true", "false"])])
      .transform((value) => value === true || value === "true"),
  });
};

export type DeliveryEstimateFormValues = z.infer<ReturnType<typeof validationDeliveryEstimate>>;
