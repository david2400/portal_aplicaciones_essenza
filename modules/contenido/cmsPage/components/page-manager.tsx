/** @format */

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import Swal from "sweetalert2";
import { Buttons } from "@repo/ui/buttons/scenes";
import { Badge } from "@repo/ui/badges/scenes/badge";
import {
  HiOutlineDocumentText,
  HiOutlineGlobeAlt,
  HiOutlinePencilSquare,
  HiOutlinePencil,
  HiOutlinePlusCircle,
  HiOutlineStar,
  HiOutlineTrash,
  HiOutlineEyeSlash,
} from "react-icons/hi2";
import { DataTable } from "@/components/data-table";
import { Link } from "@/shared/i18n/routing";
import { PageStatusBadge } from "./page-status-badge";
import { PAGE_STATUSES, formatDateTime, nowLocalDateTime, type PageStatus } from "../constants";
import type { ICmsPage } from "../models/cmsPage.interface";
import {
  deletePageServerAction,
  updatePageServerAction,
} from "@/app/[locale]/contenido/pages/actions";

export const CmsPageManager = ({ initialData }: { initialData: ICmsPage[] }) => {
  const router = useRouter();
  const t = useTranslations("Administre.cmsPage");
  const tStatuses = useTranslations("Administre.cmsPage.statuses");
  const tTypes = useTranslations("Administre.cmsPage.types");
  const tCommon = useTranslations("Administre.common");

  const [statusFilter, setStatusFilter] = useState<PageStatus | "ALL">("ALL");

  const data = useMemo(
    () =>
      [...initialData]
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || (b.id ?? 0) - (a.id ?? 0))
        .filter((page) => statusFilter === "ALL" || (page.status || "DRAFT") === statusFilter),
    [initialData, statusFilter],
  );

  const metrics = useMemo(
    () => ({
      total: initialData.length,
      published: initialData.filter((page) => page.status === "PUBLISHED").length,
      drafts: initialData.filter((page) => !page.status || page.status === "DRAFT").length,
      featured: initialData.filter((page) => page.isFeatured).length,
    }),
    [initialData],
  );

  const showError = (message?: string) =>
    Swal.fire({ title: tCommon("errorTitle"), text: message || tCommon("unexpectedError"), icon: "error" });

  const togglePublish = async (page: ICmsPage) => {
    if (page.id == null) return;
    const publish = page.status !== "PUBLISHED";
    const response = await updatePageServerAction({
      id: page.id,
      status: publish ? "PUBLISHED" : "DRAFT",
      ...(publish && !page.publishedAt ? { publishedAt: nowLocalDateTime() } : {}),
    });
    if (response.success) router.refresh();
    else showError(response.error);
  };

  const handleDelete = (page: ICmsPage) => {
    if (page.id == null) return;
    const id = page.id;
    Swal.fire({
      title: tCommon("deleteConfirmTitle"),
      text: tCommon("deleteConfirmText", { name: page.title ?? `#${id}` }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: tCommon("deleteConfirmButton"),
      cancelButtonText: tCommon("cancel"),
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      const response = await deletePageServerAction(id);
      if (response.success) router.refresh();
      else showError(response.error);
    });
  };

  const columns: ColumnDef<ICmsPage>[] = [
    {
      accessorKey: "title",
      header: t("fields.title"),
      cell: ({ row }) => (
        <div className='min-w-0'>
          <Link
            href={`/administre/pages/${row.original.id}`}
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
      accessorKey: "pageType",
      header: t("fields.pageType"),
      cell: ({ row }) =>
        row.original.pageType ? (
          <Badge variant='outline'>{tTypes(row.original.pageType as never)}</Badge>
        ) : (
          "—"
        ),
    },
    {
      accessorKey: "status",
      header: t("fields.status"),
      cell: ({ row }) => <PageStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "publishedAt",
      header: t("fields.publishedAt"),
      cell: ({ row }) =>
        row.original.status === "SCHEDULED"
          ? t("scheduledFor", { date: formatDateTime(row.original.scheduledAt) })
          : formatDateTime(row.original.publishedAt),
    },
    {
      accessorKey: "sortOrder",
      header: t("fields.sortOrder"),
      cell: ({ row }) => row.original.sortOrder ?? 0,
    },
    {
      id: "actions",
      header: tCommon("actions"),
      enableSorting: false,
      cell: ({ row }) => {
        const name = row.original.title ?? `#${row.original.id}`;
        const published = row.original.status === "PUBLISHED";
        return (
          <div className='flex flex-wrap gap-2'>
            <Link
              href={`/administre/pages/${row.original.id}`}
              aria-label={tCommon("editAria", { name })}
              className='inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium transition-colors hover:bg-accent'>
              <HiOutlinePencilSquare className='h-4 w-4' aria-hidden='true' />
              {tCommon("edit")}
            </Link>
            <Buttons
              size='sm'
              variant='outline'
              aria-label={published ? t("unpublishAria", { name }) : t("publishAria", { name })}
              onClick={() => togglePublish(row.original)}>
              {published ? (
                <HiOutlineEyeSlash className='h-4 w-4' aria-hidden='true' />
              ) : (
                <HiOutlineGlobeAlt className='h-4 w-4' aria-hidden='true' />
              )}
              {published ? t("unpublish") : t("publish")}
            </Buttons>
            <Buttons
              size='sm'
              variant='ghost'
              aria-label={tCommon("deleteAria", { name })}
              onClick={() => handleDelete(row.original)}>
              <HiOutlineTrash className='h-4 w-4' aria-hidden='true' />
              {tCommon("delete")}
            </Buttons>
          </div>
        );
      },
    },
  ];

  const summaryCards = [
    { icon: HiOutlineDocumentText, label: t("total"), value: metrics.total },
    { icon: HiOutlineGlobeAlt, label: t("publishedCount"), value: metrics.published },
    { icon: HiOutlinePencil, label: t("draftCount"), value: metrics.drafts },
    { icon: HiOutlineStar, label: t("featuredCount"), value: metrics.featured },
  ];

  const filters: Array<PageStatus | "ALL"> = ["ALL", ...PAGE_STATUSES];

  return (
    <section className='flex w-full flex-col gap-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-4'>
          <div className='rounded-2xl bg-primary/10 p-3'>
            <HiOutlineDocumentText className='h-7 w-7 text-primary' aria-hidden='true' />
          </div>
          <div>
            <h2 className='text-xl font-semibold tracking-tight text-foreground'>{t("title")}</h2>
            <p className='mt-1.5 text-base text-muted-foreground'>{t("description")}</p>
          </div>
        </div>
        <Link
          href='/administre/pages/new'
          className='inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90'>
          <HiOutlinePlusCircle className='h-4 w-4' aria-hidden='true' />
          {t("create")}
        </Link>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className='rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md'>
            <div className='flex items-center justify-between text-sm font-semibold text-muted-foreground'>
              <span>{card.label}</span>
              <card.icon className='h-5 w-5 text-primary' aria-hidden='true' />
            </div>
            <p className='mt-2 text-2xl font-semibold text-foreground'>{card.value}</p>
          </div>
        ))}
      </div>

      <div role='group' aria-label={t("filterLabel")} className='flex flex-wrap gap-2'>
        {filters.map((value) => (
          <Buttons
            key={value}
            size='sm'
            variant={statusFilter === value ? "default" : "outline"}
            aria-pressed={statusFilter === value}
            onClick={() => setStatusFilter(value)}>
            {value === "ALL" ? t("allStatuses") : tStatuses(value)}
          </Buttons>
        ))}
      </div>

      <DataTable
        data={data}
        columns={columns}
        className='py-2'
        emptyTitle={t("emptyTitle")}
        emptyDescription={t("emptyDescription")}
      />
    </section>
  );
};
