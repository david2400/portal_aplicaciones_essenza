/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";

export const validationProductFeature = () => {
  const intl = useTranslations("Form");
  const required = { message: intl("requiredField") };
  const id = () => z.coerce.number({ invalid_type_error: intl("requiredField") }).int().positive(required);

  return z.object({
    productId: id(),
    featureId: id(),
    value: z.coerce.number({ invalid_type_error: intl("requiredField") }),
  });
};
