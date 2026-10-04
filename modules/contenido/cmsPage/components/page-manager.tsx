/** @format */

"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@repo/ui/badges/scenes/badge";
import {
  HiOutlineDocumentText,
  HiOutlineEyeSlash,
  HiOutlineGlobeAlt,
  HiOutlinePencil,
  HiOutlinePencilSquare,
  HiOutlinePlusCircle,
  HiOutlineStar,
} from "react-icons/hi2";
import { CrudManager } from "@/components/crud-manager";
import type { GridColumn, GridFilter } from "@/components/data-grid";
import { confirm, notify } from "@/components/notifications";
import { Link, useRouter } from "@/shared/i18n/routing";
import { PageStatusBadge } from "./page-status-badge";
import { PAGE_STATUSES, formatDateTime, nowLocalDateTime } from "../constants";
import type { ICmsPage } from "../models/cmsPage.interface";
import { deletePageServerAction, updatePageServerAction } from "@/app/[locale]/contenido/pages/actions";

/** Páginas CMS: estado editorial, publicación individual y en lote, destacadas y exportación. */
export const CmsPageManager = ({ initialData }: { initialData: ICmsPage[] }) => {
  const router = useRouter();
  const t = useTranslations("Administre.cmsPage");
  const tStatuses = useTranslations("Administre.cmsPage.statuses");
  const tTypes = useTranslations("Administre.cmsPage.types");
  const tCommon = useTranslations("Administre.common");
  const tCrud = useTranslations("Crud");

  const data = useMemo(
    () => [...initialData].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || (b.id ?? 0) - (a.id ?? 0)),
    [initialData],
  );

  const published = initialData.filter((page) => page.status === "PUBLISHED").length;
  const drafts = initialData.filter((page) => !page.status || page.status === "DRAFT").length;
  const featured = initialData.filter((page) => page.isFeatured).length;

  const setPublished = (page: ICmsPage, publish: boolean) =>
    updatePageServerAction({
      id: page.id as number,
      status: publish ? "PUBLISHED" : "DRAFT",
      ...(publish && !page.publishedAt ? { publishedAt: nowLocalDateTime() } : {}),
    });

  const togglePublish = async (page: ICmsPage) => {
    if (page.id == null) return;
    const publish = page.status !== "PUBLISHED";
    const response = await setPublished(page, publish);
    if (response.success) {
      notify.success(publish ? t("publishedOk") : t("unpublishedOk"), page.title);
      router.refresh();
    } else {
      notify.error(tCommon("errorTitle"), response.error || tCommon("unexpectedError"));
    }
  };

  const bulkPublish = async (rows: ICmsPage[], publish: boolean) => {
    const targets = rows.filter((page) => page.id != null && (page.status === "PUBLISHED") !== publish);
    if (targets.length === 0) return;
    const ok = await confirm({
      title: publish ? t("bulkPublishTitle", { count: targets.length }) : t("bulkUnpublishTitle", { count: targets.length }),
      confirmLabel: publish ? t("publish") : t("unpublish"),
    });
    if (!ok) return;
    const results = await Promise.allSettled(targets.map((page) => setPublished(page, publish)));
    const failed = results.filter((result) => result.status === "rejected" || !result.value.success).length;
    if (failed === 0) notify.success(tCrud("bulkUpdated", { count: targets.length }));
    else notify.warning(tCrud("bulkPartial", { ok: targets.length - failed, failed }));
    router.refresh();
  };

  const scheduleLabel = (page: ICmsPage) =>
    page.status === "SCHEDULED"
      ? t("scheduledFor", { date: formatDateTime(page.scheduledAt) })
      : formatDateTime(page.publishedAt);

  const columns = useMemo<GridColumn<ICmsPage>[]>(
    () => [
      {
        id: "title",
        accessorFn: (row) => row.title ?? "",
        header: t("fields.title"),
        meta: { label: t("fields.title"), hideable: false, exportValue: (row) => row.title },
        cell: ({ row }) => (
          <div className='min-w-0'>
            <Link
              href={`/contenido/pages/${row.original.id}`}
              className='inline-flex items-center gap-1.5 font-semibold text-foreground underline-offset-4 hover:underline'>
              {row.original.isFeatured ? (
                <HiOutlineStar className='h-4 w-4 text-warning' aria-label={t("fields.isFeatured")} />
              ) : null}
              {row.original.title}
            </Link>
            <p className='truncate text-xs text-muted-foreground'>/{row.original.slug}</p>
          </div>
        ),
      },
      {
        id: "pageType",
        header: t("fields.pageType"),
        enableSorting: false,
        meta: {
          label: t("fields.pageType"),
          exportValue: (row) => (row.pageType ? tTypes(row.pageType as never) : ""),
        },
        cell: ({ row }) =>
          row.original.pageType ? <Badge variant='outline'>{tTypes(row.original.pageType as never)}</Badge> : "—",
      },
      {
        id: "status",
        header: t("fields.status"),
        enableSorting: false,
        meta: { label: t("fields.status"), exportValue: (row) => tStatuses((row.status || "DRAFT") as never) },
        cell: ({ row }) => <PageStatusBadge status={row.original.status} />,
      },
      {
        id: "publishedAt",
        accessorFn: (row) => row.publishedAt ?? row.scheduledAt ?? "",
        header: t("fields.publishedAt"),
        meta: { label: t("fields.publishedAt"), exportValue: (row) => row.publishedAt ?? row.scheduledAt },
        cell: ({ row }) => scheduleLabel(row.original),
      },
      {
        id: "sortOrder",
        accessorFn: (row) => row.sortOrder ?? 0,
        header: t("fields.sortOrder"),
        meta: { label: t("fields.sortOrder"), align: "right", exportValue: (row) => row.sortOrder ?? 0 },
        cell: ({ row }) => row.original.sortOrder ?? 0,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, tStatuses, tTypes],
  );

  const filters: GridFilter<ICmsPage>[] = [
    {
      id: "status",
      label: t("fields.status"),
      options: PAGE_STATUSES.map((status) => ({ value: status, label: tStatuses(status) })),
      accessor: (row) => row.status || "DRAFT",
    },
    {
      id: "featured",
      label: t("fields.isFeatured"),
      options: [
        { value: "true", label: tCommon("yes") },
        { value: "false", label: tCommon("no") },
      ],
      accessor: (row) => String(Boolean(row.isFeatured)),
    },
  ];

  return (
    <CrudManager<ICmsPage>
      gridId='paginas-cms'
      namespace='Administre.cmsPage'
      icon={HiOutlineDocumentText}
      eyebrow={tCrud("domains.content")}
      data={data}
      columns={columns}
      filters={filters}
      stats={[
        { label: t("total"), value: initialData.length, icon: HiOutlineDocumentText },
        { label: t("publishedCount"), value: published, icon: HiOutlineGlobeAlt, tone: "success" },
        { label: t("draftCount"), value: drafts, icon: HiOutlinePencil, tone: drafts > 0 ? "warning" : "default" },
        { label: t("featuredCount"), value: featured, icon: HiOutlineStar },
      ]}
      rowLabel={(row) => row.title ?? `#${row.id}`}
      searchPlaceholder={t("searchPlaceholder")}
      searchText={(row) => `${row.title ?? ""} ${row.slug ?? ""}`}
      headerActions={
        <Link
          href='/contenido/pages/new'
          className='inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90'>
          <HiOutlinePlusCircle className='h-4 w-4' aria-hidden='true' />
          {t("create")}
        </Link>
      }
      extraRowActions={(row) => {
        const isPublished = row.status === "PUBLISHED";
        return [
          {
            label: tCommon("edit"),
            icon: HiOutlinePencilSquare,
            onSelect: () => router.push(`/contenido/pages/${row.id}`),
          },
          {
            label: isPublished ? t("unpublish") : t("publish"),
            icon: isPublished ? HiOutlineEyeSlash : HiOutlineGlobeAlt,
            onSelect: () => void togglePublish(row),
          },
        ];
      }}
      extraBulkActions={[
        { label: t("publish"), icon: HiOutlineGlobeAlt, onAction: (rows) => bulkPublish(rows, true) },
        { label: t("unpublish"), icon: HiOutlineEyeSlash, onAction: (rows) => bulkPublish(rows, false) },
      ]}
      onDelete={(id) => deletePageServerAction(id)}
    />
  );
};
