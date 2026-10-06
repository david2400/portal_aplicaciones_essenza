/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";

export const TAXONOMY_LIMITS = { name: 150, slug: 180, description: 1000 } as const;

/**
 * Validación común (marca, categoría, subcategoría). Replica las reglas del
 * backend para avisar en el campo antes de enviar: nombre obligatorio,
 * slug opcional con formato URL y longitudes máximas.
 */
export const validationTaxonomy = ({ withCategory = false }: { withCategory?: boolean } = {}) => {
  const intl = useTranslations("Form");
  const base = z.object({
    name: z
      .string()
      .trim()
      .min(1, { message: intl("requiredField") })
      .max(TAXONOMY_LIMITS.name, { message: intl("maxLength", { max: TAXONOMY_LIMITS.name }) }),
    slug: z
      .string()
      .trim()
      .max(TAXONOMY_LIMITS.slug, { message: intl("maxLength", { max: TAXONOMY_LIMITS.slug }) })
      .regex(/^$|^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: intl("invalidSlug") })
      .optional(),
    description: z
      .string()
      .max(TAXONOMY_LIMITS.description, { message: intl("maxLength", { max: TAXONOMY_LIMITS.description }) })
      .optional(),
  });

  return withCategory
    ? base.extend({
        category_id: z.coerce
          .number({ invalid_type_error: intl("requiredField") })
          .int()
          .positive({ message: intl("requiredField") }),
      })
    : base;
};
