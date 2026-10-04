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
  HiOutlineExclamationTriangle,
  HiOutlineHashtag,
  HiOutlineMagnifyingGlass,
  HiOutlineQueueList,
  HiOutlineTrash,
} from "react-icons/hi2";
import { DataTable } from "@/components/data-table";
import { BreakdownList } from "@/components/breakdown-list";
import { aggregateTerms, queryDate, withinDays } from "../analytics";
import type { ISearchQuery } from "../models/searchQuery.interface";
import { deleteSearchQueryServerAction } from "@/app/[locale]/contenido/search-queries/actions";

const PERIODS = [7, 30, 90, null] as const;
type Period = (typeof PERIODS)[number];

const dateTimeFormatter = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" });
const formatDateTime = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateTimeFormatter.format(date);
};

export const SearchQueryManager = ({ initialData }: { initialData: ISearchQuery[] }) => {
  const router = useRouter();
  const t = useTranslations("Administre.searchQuery");
  const tCommon = useTranslations("Administre.common");

  const [period, setPeriod] = useState<Period>(30);

  const queries = useMemo(
    () =>
      initialData
        .filter((query) => withinDays(query, period))
        .sort((a, b) => (queryDate(b) ?? "").localeCompare(queryDate(a) ?? "")),
    [initialData, period],
  );

  const terms = useMemo(() => aggregateTerms(queries), [queries]);

  const metrics = useMemo(() => {
    const total = queries.length;
    const zero = queries.filter((query) => (query.totalResults ?? 0) === 0).length;
    const results = queries.reduce((acc, query) => acc + (query.totalResults ?? 0), 0);
    return {
      total,
      unique: terms.length,
      zeroRate: total > 0 ? zero / total : 0,
      avgResults: total > 0 ? results / total : 0,
    };
  }, [queries, terms]);

  // Términos que nunca devolvieron resultados: oportunidades de catálogo o sinónimos.
  const opportunities = useMemo(
    () => terms.filter((term) => term.zeroResults === term.count).slice(0, 10),
    [terms],
  );

  const handleDelete = (query: ISearchQuery) => {
    if (query.id == null) return;
    const id = query.id;
    Swal.fire({
      title: tCommon("deleteConfirmTitle"),
      text: tCommon("deleteConfirmText", { name: query.query ?? `#${id}` }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: tCommon("deleteConfirmButton"),
      cancelButtonText: tCommon("cancel"),
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      const response = await deleteSearchQueryServerAction(id);
      if (response.success) router.refresh();
      else Swal.fire({ title: tCommon("errorTitle"), text: response.error, icon: "error" });
    });
  };

  const columns: ColumnDef<ISearchQuery>[] = [
    {
      accessorKey: "query",
      header: t("fields.query"),
      cell: ({ row }) => <span className='font-semibold text-foreground'>“{row.original.query}”</span>,
    },
    {
      accessorKey: "totalResults",
      header: t("fields.totalResults"),
      cell: ({ row }) => {
        const value = row.original.totalResults ?? 0;
        return <Badge variant={value === 0 ? "destructive" : "secondary"}>{value}</Badge>;
      },
    },
    {
      accessorKey: "customerId",
      header: t("fields.customerId"),
      cell: ({ row }) => (row.original.customerId != null ? `#${row.original.customerId}` : t("anonymous")),
    },
    {
      accessorKey: "sortBy",
      header: t("fields.sortBy"),
      cell: ({ row }) => row.original.sortBy || "—",
    },
    {
      id: "pagination",
      header: t("fields.page"),
      cell: ({ row }) => t("pageOf", { page: (row.original.page ?? 0) + 1, size: row.original.pageSize ?? "—" }),
    },
    {
      id: "date",
      header: t("fields.lastRunAt"),
      cell: ({ row }) => formatDateTime(queryDate(row.original)),
    },
    {
      id: "actions",
      header: tCommon("actions"),
      enableSorting: false,
      cell: ({ row }) => (
        <Buttons
          size='sm'
          variant='ghost'
          aria-label={tCommon("deleteAria", { name: row.original.query ?? `#${row.original.id}` })}
          onClick={() => handleDelete(row.original)}>
          <HiOutlineTrash className='h-4 w-4' aria-hidden='true' />
          {tCommon("delete")}
        </Buttons>
      ),
    },
  ];

  const summaryCards = [
    { icon: HiOutlineMagnifyingGlass, label: t("total"), value: metrics.total },
    { icon: HiOutlineHashtag, label: t("uniqueTerms"), value: metrics.unique },
    {
      icon: HiOutlineExclamationTriangle,
      label: t("zeroRate"),
      value: `${(metrics.zeroRate * 100).toFixed(1)}%`,
    },
    { icon: HiOutlineQueueList, label: t("avgResults"), value: metrics.avgResults.toFixed(1) },
  ];

  return (
    <section className='flex w-full flex-col gap-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-4'>
          <div className='rounded-2xl bg-primary/10 p-3'>
            <HiOutlineMagnifyingGlass className='h-7 w-7 text-primary' aria-hidden='true' />
          </div>
          <div>
            <h2 className='text-xl font-semibold tracking-tight text-foreground'>{t("title")}</h2>
            <p className='mt-1.5 text-base text-muted-foreground'>{t("description")}</p>
          </div>
        </div>
        <div role='group' aria-label={t("periodLabel")} className='flex flex-wrap gap-2'>
          {PERIODS.map((value) => (
            <Buttons
              key={String(value)}
              size='sm'
              variant={period === value ? "default" : "outline"}
              aria-pressed={period === value}
              onClick={() => setPeriod(value)}>
              {value == null ? t("allTime") : t("lastDays", { days: value })}
            </Buttons>
          ))}
        </div>
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

      <div className='grid gap-4 lg:grid-cols-2'>
        <BreakdownList
          title={t("topTerms")}
          emptyLabel={t("emptyBreakdown")}
          items={terms.slice(0, 10).map((term) => ({
            key: term.term,
            label: term.term,
            value: term.count,
            hint: t("avgResultsHint", { value: term.avgResults.toFixed(0) }),
          }))}
        />

        <div className='rounded-2xl border border-border bg-card p-5 shadow-sm'>
          <h3 className='text-base font-semibold text-foreground'>{t("opportunities")}</h3>
          <p className='mt-1 text-sm text-muted-foreground'>{t("opportunitiesHint")}</p>
          {opportunities.length === 0 ? (
            <p className='mt-4 text-sm text-muted-foreground'>{t("noOpportunities")}</p>
          ) : (
            <ul className='mt-4 divide-y divide-border'>
              {opportunities.map((term) => (
                <li key={term.term} className='flex items-center justify-between gap-3 py-2 text-sm'>
                  <span className='min-w-0 truncate font-medium text-foreground'>“{term.term}”</span>
                  <span className='shrink-0 text-muted-foreground'>
                    {t("timesSearched", { count: term.count })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className='space-y-3'>
        <h3 className='text-base font-semibold text-foreground'>{t("recent")}</h3>
        <DataTable
          data={queries}
          columns={columns}
          className='py-2'
          emptyTitle={t("emptyTitle")}
          emptyDescription={t("emptyDescription")}
        />
      </div>
    </section>
  );
};
