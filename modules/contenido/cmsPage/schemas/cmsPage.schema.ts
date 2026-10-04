/** @format */

import { useTranslations } from "next-intl";
import { z } from "zod";
import { PAGE_LIMITS, PAGE_STATUSES, PAGE_TYPES } from "../constants";

const isJson = (value?: string) => {
  if (!value?.trim()) return true;
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
};

export const validationCmsPage = () => {
  const intl = useTranslations("Form");
  const max = (n: number) => z.string().trim().max(n, { message: intl("maxLength", { max: n }) });

  return z
    .object({
      title: max(PAGE_LIMITS.title).min(1, { message: intl("requiredField") }),
      slug: max(PAGE_LIMITS.slug)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$|^$/, { message: intl("invalidSlug") })
        .optional(),
      content: z.string().trim().min(1, { message: intl("requiredField") }),
      excerpt: max(PAGE_LIMITS.excerpt).optional(),
      metaTitle: max(PAGE_LIMITS.metaTitle).optional(),
      metaDescription: max(PAGE_LIMITS.metaDescription).optional(),
      metaKeywords: max(PAGE_LIMITS.metaKeywords).optional(),
      status: z.enum(PAGE_STATUSES),
      pageType: z.enum(PAGE_TYPES),
      template: max(PAGE_LIMITS.template).optional(),
      isFeatured: z
        .union([z.boolean(), z.enum(["true", "false"])])
        .transform((value) => value === true || value === "true"),
      sortOrder: z.coerce.number({ invalid_type_error: intl("requiredField") }).int().min(0),
      publishedAt: z.string().optional(),
      scheduledAt: z.string().optional(),
      authorName: max(PAGE_LIMITS.authorName).optional(),
      featuredImage: z
        .union([z.literal(""), max(PAGE_LIMITS.featuredImage).url({ message: intl("invalidUrl") })])
        .optional(),
      customFields: z.string().optional().refine(isJson, { message: intl("invalidJson") }),
    })
    .refine((values) => values.status !== "SCHEDULED" || !!values.scheduledAt, {
      path: ["scheduledAt"],
      message: intl("requiredField"),
    });
};

export type CmsPageFormValues = z.infer<ReturnType<typeof validationCmsPage>>;
