/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { notify } from "@/components/notifications";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import { Link } from "@/shared/i18n/routing";
import { FormCmsPage } from "../scenes/formCmsPage";
import { validationCmsPage, type CmsPageFormValues } from "../schemas/cmsPage.schema";
import type { ICmsPage, ICmsPageCreateRequest } from "../models/cmsPage.interface";
import { PageStatusBadge } from "./page-status-badge";
import {
  formatDateTime,
  fromInputDateTime,
  nowLocalDateTime,
  toInputDateTime,
} from "../constants";
import {
  createPageServerAction,
  updatePageServerAction,
} from "@/app/[locale]/contenido/pages/actions";

const toFormValues = (page?: ICmsPage | null) => ({
  title: page?.title ?? "",
  slug: page?.slug ?? "",
  content: page?.content ?? "",
  excerpt: page?.excerpt ?? "",
  metaTitle: page?.metaTitle ?? "",
  metaDescription: page?.metaDescription ?? "",
  metaKeywords: page?.metaKeywords ?? "",
  status: page?.status || "DRAFT",
  pageType: page?.pageType || "STATIC",
  template: page?.template ?? "",
  isFeatured: String(Boolean(page?.isFeatured)),
  sortOrder: page?.sortOrder ?? 0,
  publishedAt: toInputDateTime(page?.publishedAt),
  scheduledAt: toInputDateTime(page?.scheduledAt),
  authorName: page?.authorName ?? "",
  featuredImage: page?.featuredImage ?? "",
  customFields: page?.customFields ?? "",
});

/**
 * Formulario → payload con fechas en `LocalDateTime`.
 * El PUT ignora los `null` (MapStruct `IGNORE`), así que al editar los textos
 * vaciados se envían como `""` para poder borrarlos. El slug vacío se omite
 * para que el backend lo regenere desde el título.
 */
const toPayload = (values: CmsPageFormValues, isUpdate: boolean): ICmsPageCreateRequest => {
  const blank = (value?: string) => (value?.trim() ? value.trim() : isUpdate ? "" : undefined);
  return {
    title: values.title,
    slug: values.slug?.trim() || undefined,
    content: values.content,
    excerpt: blank(values.excerpt),
    metaTitle: blank(values.metaTitle),
    metaDescription: blank(values.metaDescription),
    metaKeywords: blank(values.metaKeywords),
    status: values.status,
    pageType: values.pageType,
    template: blank(values.template),
    isFeatured: values.isFeatured,
    sortOrder: values.sortOrder,
    // Al publicar sin fecha se registra el momento actual.
    publishedAt:
      fromInputDateTime(values.publishedAt) ??
      (values.status === "PUBLISHED" ? nowLocalDateTime() : undefined),
    scheduledAt: values.status === "SCHEDULED" ? fromInputDateTime(values.scheduledAt) : undefined,
    authorName: blank(values.authorName),
    featuredImage: blank(values.featuredImage),
    customFields: blank(values.customFields),
  };
};

export const CmsPageEditor = ({ page }: { page?: ICmsPage | null }) => {
  const router = useRouter();
  const t = useTranslations("Administre.cmsPage");
  const tCommon = useTranslations("Administre.common");
  const validationSchema = validationCmsPage();
  const pageId = page?.id;
  const isNew = pageId == null;

  const handleSubmit = async (values: CmsPageFormValues) => {
    const payload = toPayload(values, !isNew);
    const result = isNew
      ? await createPageServerAction(payload)
      : await updatePageServerAction({ ...payload, id: pageId });

    if (!result.success) {
      notify.error(tCommon("errorTitle"), result.error || tCommon("unexpectedError"));
      return;
    }

    notify.success(isNew ? tCommon("createdSuccess") : tCommon("updatedSuccess"));

    const createdId = "data" in result ? result.data?.id : undefined;
    if (isNew && createdId != null) {
      router.replace(`/contenido/pages/${createdId}`);
    } else {
      router.refresh();
    }
  };

  return (
    <section className='flex w-full flex-col gap-6'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div className='space-y-2'>
          <Link
            href='/contenido/pages'
            className='inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground'>
            <HiOutlineArrowLeft className='h-4 w-4' aria-hidden='true' />
            {t("backToList")}
          </Link>
          <h2 className='text-xl font-semibold tracking-tight text-foreground'>
            {isNew ? t("createTitle") : t("editTitle")}
          </h2>
        </div>
        {!isNew ? (
          <div className='flex items-center gap-3 text-sm text-muted-foreground'>
            <PageStatusBadge status={page?.status} />
            <span>{t("lastUpdated", { date: formatDateTime(page?.updatedAt ?? page?.createdAt) })}</span>
          </div>
        ) : null}
      </div>

      <FormCmsPage
        key={page?.id ?? "new"}
        initialValues={toFormValues(page)}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        isNew={isNew}
      />
    </section>
  );
};
