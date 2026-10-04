/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";
import { JSON_MAX, SEGMENTS } from "../constants";

const isJson = (value?: string) => {
  if (!value?.trim()) return true;
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
};

export const validationPersonalizationProfile = () => {
  const intl = useTranslations("Form");
  const json = () =>
    z
      .string()
      .max(JSON_MAX, { message: intl("maxLength", { max: JSON_MAX }) })
      .optional()
      .refine(isJson, { message: intl("invalidJson") });

  return z.object({
    customerId: z.coerce
      .number({ invalid_type_error: intl("requiredField") })
      .int()
      .positive({ message: intl("requiredField") }),
    sessionId: z.string().trim().max(100, { message: intl("maxLength", { max: 100 }) }).optional(),
    segment: z.enum(SEGMENTS),
    status: z.string().trim().max(50, { message: intl("maxLength", { max: 50 }) }).optional(),
    personalizationScore: z
      .union([z.literal(""), z.coerce.number().min(0).max(1, { message: intl("range", { min: 0, max: 1 }) })])
      .optional()
      .transform((value) => (value === "" || value == null ? undefined : value)),
    contextMetadataJson: json(),
    recommendedProductsJson: json(),
    dynamicPricingJson: json(),
    personalizedContentJson: json(),
    personalizedOffersJson: json(),
    uiPersonalizationJson: json(),
    purchaseIntentJson: json(),
  });
};

export type PersonalizationProfileFormValues = z.infer<ReturnType<typeof validationPersonalizationProfile>>;
