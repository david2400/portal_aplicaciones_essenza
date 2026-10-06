/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";

export const validationWarehouse = () => {
  const intl = useTranslations("Form");

  return z.object({
    name: z.string().trim().min(1, { message: intl("requiredField") }),
    code: z.string().trim().min(1, { message: intl("requiredField") }),
    address: z.string().optional(),
    // Ubicación (catálogo `parametros`): el select entrega el id como string.
    country_id: z.string().min(1, { message: intl("requiredField") }),
    state_id: z.string().min(1, { message: intl("requiredField") }),
    city_id: z.string().min(1, { message: intl("requiredField") }),
    active: z.union([z.boolean(), z.enum(["true", "false"])]).transform((value) => value === true || value === "true"),
  });
};
