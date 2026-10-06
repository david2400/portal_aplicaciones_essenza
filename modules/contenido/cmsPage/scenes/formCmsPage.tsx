/** @format */

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@repo/ui/form/scenes/form-field";
import { FormTextAreaField } from "@repo/ui/form/scenes/form-area";
import { FormSelectField } from "@repo/ui/form/scenes/form-select";
import { Buttons } from "@repo/ui/buttons/scenes/index";
import { HiOutlineArrowPath } from "react-icons/hi2";
import type { IFormProps } from "@repo/ui/form/models/form.interface";
import { PAGE_LIMITS, PAGE_STATUSES, PAGE_TYPES, SEO_RECOMMENDED, slugify } from "../constants";

const Counter = ({ value, max, recommended }: { value?: string; max: number; recommended?: number }) => {
  const length = value?.length ?? 0;
  const over = recommended != null && length > recommended;
  return (
    <span className={`text-xs ${over ? "text-warning" : "text-muted-foreground"}`} aria-live='polite'>
      {length}/{recommended ?? max}
    </span>
  );
};

export const FormCmsPage = ({
  initialValues,
  validationSchema,
  onSubmit,
  isNew = false,
}: IFormProps<any> & { isNew?: boolean }) => {
  const t = useTranslations("Administre.cmsPage");
  const tCommon = useTranslations("Administre.common");
  type CmsPageInputs = z.infer<typeof validationSchema>;

  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [slugTouched, setSlugTouched] = useState(!isNew);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<CmsPageInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  const [title, slug, content, excerpt, metaTitle, metaDescription, featuredImage, status] = useWatch({
    control,
    name: ["title", "slug", "content", "excerpt", "meta_title", "meta_description", "featured_image", "status"],
  }) as string[];

  // Mientras el usuario no edite el slug, se deriva del título.
  const handleTitleBlur = () => {
    if (!slugTouched && title) setValue("slug" as never, slugify(title) as never);
  };

  const regenerateSlug = () => {
    setValue("slug" as never, slugify(title ?? "") as never, { shouldValidate: true });
  };

  const statusOptions = PAGE_STATUSES.map((value) => ({ id: value, value, label: t(`statuses.${value}`) }));
  const typeOptions = PAGE_TYPES.map((value) => ({ id: value, value, label: t(`types.${value}`) }));
  const booleanOptions = [
    { id: "true", value: "true", label: tCommon("yes") },
    { id: "false", value: "false", label: tCommon("no") },
  ];

  const serpTitle = metaTitle || title || t("seo.placeholderTitle");
  const serpDescription = metaDescription || excerpt || t("seo.placeholderDescription");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='grid gap-6 lg:grid-cols-3'>
      <div className='space-y-6 lg:col-span-2'>
        <div className='space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm'>
          <div onBlur={handleTitleBlur}>
            <FormField controller={{ control, name: "title" }} label={t("fields.title")} />
            <div className='mt-1 flex justify-end'>
              <Counter value={title} max={PAGE_LIMITS.title} />
            </div>
          </div>

          <div className='flex items-end gap-2'>
            <div className='flex-1' onInput={() => setSlugTouched(true)}>
              <FormField
                controller={{ control, name: "slug" }}
                label={t("fields.slug")}
                description={t("slugHint", { slug: slug || "…" })}
              />
            </div>
            <Buttons type='button' variant='outline' onClick={regenerateSlug} aria-label={t("regenerateSlug")}>
              <HiOutlineArrowPath className='h-4 w-4' aria-hidden='true' />
            </Buttons>
          </div>

          <div>
            <FormTextAreaField controller={{ control, name: "excerpt" }} label={t("fields.excerpt")} rows={2} />
            <div className='mt-1 flex justify-end'>
              <Counter value={excerpt} max={PAGE_LIMITS.excerpt} />
            </div>
          </div>
        </div>

        <div className='space-y-3 rounded-2xl border border-border bg-card p-5 shadow-sm'>
          <div className='flex items-center justify-between gap-2'>
            <h3 className='text-base font-semibold text-foreground'>{t("fields.content")}</h3>
            <div role='group' aria-label={t("contentMode")} className='flex gap-1'>
              {(["edit", "preview"] as const).map((value) => (
                <Buttons
                  key={value}
                  type='button'
                  size='sm'
                  variant={mode === value ? "default" : "outline"}
                  aria-pressed={mode === value}
                  onClick={() => setMode(value)}>
                  {t(`modes.${value}`)}
                </Buttons>
              ))}
            </div>
          </div>
          <p className='text-xs text-muted-foreground'>{t("contentHint")}</p>
          <div className={mode === "edit" ? "" : "hidden"}>
            <FormTextAreaField
              controller={{ control, name: "content" }}
              label={t("fields.content")}
              rows={18}
              classNameInput='font-mono text-sm'
            />
          </div>
          {mode === "preview" ? (
            <iframe
              title={t("previewTitle")}
              sandbox=''
              srcDoc={`<!doctype html><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;line-height:1.6;padding:16px;color:#111}img{max-width:100%}</style>${content ?? ""}`}
              className='h-[480px] w-full rounded-xl border border-border bg-white'
            />
          ) : null}
        </div>

        <div className='space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm'>
          <h3 className='text-base font-semibold text-foreground'>{t("seo.title")}</h3>
          <div aria-label={t("seo.preview")} className='rounded-xl border border-border bg-background p-4'>
            <p className='truncate text-xs text-muted-foreground'>essenza.com › {slug || "…"}</p>
            <p className='truncate text-lg text-primary'>{serpTitle}</p>
            <p className='line-clamp-2 text-sm text-muted-foreground'>{serpDescription}</p>
          </div>
          <div>
            <FormField controller={{ control, name: "meta_title" }} label={t("fields.metaTitle")} />
            <div className='mt-1 flex justify-end'>
              <Counter value={metaTitle} max={PAGE_LIMITS.meta_title} recommended={SEO_RECOMMENDED.meta_title} />
            </div>
          </div>
          <div>
            <FormTextAreaField
              controller={{ control, name: "meta_description" }}
              label={t("fields.metaDescription")}
              rows={3}
            />
            <div className='mt-1 flex justify-end'>
              <Counter
                value={metaDescription}
                max={PAGE_LIMITS.meta_description}
                recommended={SEO_RECOMMENDED.meta_description}
              />
            </div>
          </div>
          <FormField
            controller={{ control, name: "meta_keywords" }}
            label={t("fields.metaKeywords")}
            description={t("keywordsHint")}
          />
        </div>
      </div>

      <aside className='space-y-6'>
        <div className='space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm'>
          <h3 className='text-base font-semibold text-foreground'>{t("publishing")}</h3>
          <FormSelectField
            controller={{ control, name: "status" }}
            label={t("fields.status")}
            data={statusOptions}
            triggerClassName='!w-full'
          />
          {status === "SCHEDULED" ? (
            <FormField
              controller={{ control, name: "scheduled_at" }}
              type='datetime-local'
              label={t("fields.scheduledAt")}
            />
          ) : null}
          <FormField
            controller={{ control, name: "published_at" }}
            type='datetime-local'
            label={t("fields.publishedAt")}
            description={t("publishedAtHint")}
          />
          <FormField controller={{ control, name: "author_name" }} label={t("fields.authorName")} />
          <Buttons type='submit' loading={isSubmitting} className='w-full rounded-full'>
            {tCommon("save")}
          </Buttons>
        </div>

        <div className='space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm'>
          <h3 className='text-base font-semibold text-foreground'>{t("organization")}</h3>
          <FormSelectField
            controller={{ control, name: "page_type" }}
            label={t("fields.pageType")}
            data={typeOptions}
            triggerClassName='!w-full'
          />
          <FormField controller={{ control, name: "template" }} label={t("fields.template")} />
          <div className='grid grid-cols-2 gap-4'>
            <FormSelectField
              controller={{ control, name: "is_featured" }}
              label={t("fields.isFeatured")}
              data={booleanOptions}
              triggerClassName='!w-full'
            />
            <FormField
              controller={{ control, name: "sort_order" }}
              type='number'
              step='1'
              min={0}
              label={t("fields.sortOrder")}
            />
          </div>
        </div>

        <div className='space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm'>
          <h3 className='text-base font-semibold text-foreground'>{t("fields.featuredImage")}</h3>
          <FormField
            controller={{ control, name: "featured_image" }}
            type='url'
            placeholder='https://'
            label={t("fields.featuredImage")}
          />
          {featuredImage && /^https?:\/\//.test(featuredImage) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={featuredImage}
              alt={t("featuredImageAlt")}
              className='aspect-video w-full rounded-xl border border-border object-cover'
            />
          ) : null}
        </div>

        <div className='space-y-2 rounded-2xl border border-border bg-card p-5 shadow-sm'>
          <FormTextAreaField
            controller={{ control, name: "custom_fields" }}
            label={t("fields.customFields")}
            rows={5}
            classNameInput='font-mono text-xs'
          />
          <p className='text-xs text-muted-foreground'>{t("customFieldsHint")}</p>
        </div>
      </aside>
    </form>
  );
};
