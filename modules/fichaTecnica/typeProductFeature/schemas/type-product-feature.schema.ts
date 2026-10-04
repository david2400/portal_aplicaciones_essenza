/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";

export const validationTypeProductFeature = () => {
  const intl = useTranslations("Form");
  const id = () =>
    z.coerce
      .number({ invalid_type_error: intl("requiredField") })
      .int()
      .positive({ message: intl("requiredField") });

  return z.object({ typeProductId: id(), featureId: id() });
};
