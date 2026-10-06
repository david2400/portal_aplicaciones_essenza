/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";
import { RECOMMENDATION_CONTEXTS, RECOMMENDATION_TYPES } from "../constants";

const bool = () =>
  z.union([z.boolean(), z.enum(["true", "false"])]).transform((value) => value === true || value === "true");

export const validationRecommendation = () => {
  const intl = useTranslations("Form");
  const number = () => z.coerce.number({ invalid_type_error: intl("requiredField") });

  return z.object({
    customer_id: number().int().positive({ message: intl("requiredField") }),
    product_id: number().int().positive({ message: intl("requiredField") }),
    recommendation_type: z.enum(RECOMMENDATION_TYPES),
    context: z.enum(RECOMMENDATION_CONTEXTS),
    score: number()
      .min(0, { message: intl("range", { min: 0, max: 1 }) })
      .max(1, { message: intl("range", { min: 0, max: 1 }) }),
    position: number().int().min(1, { message: intl("positiveNumber") }),
    reason: z.string().trim().max(255, { message: intl("maxLength", { max: 255 }) }).optional(),
    is_clicked: bool(),
    is_purchased: bool(),
  });
};

export type RecommendationFormValues = z.infer<ReturnType<typeof validationRecommendation>>;
