/** @format */

"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Buttons } from "@repo/ui/buttons/scenes";
import { Badge } from "@repo/ui/badges/scenes/badge";
import {
  HiOutlineExclamationTriangle,
  HiOutlineHashtag,
  HiOutlineMagnifyingGlass,
  HiOutlineQueueList,
} from "react-icons/hi2";
import { CrudManager } from "@/components/crud-manager";
import type { GridColumn, GridFilter } from "@/components/data-grid";
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

/** Analítica de búsquedas: periodo, términos frecuentes, oportunidades y depuración en lote. */
export const SearchQueryManager = ({ initialData }: { initialData: ISearchQuery[] }) => {
  const t = useTranslations("Administre.searchQuery");
  const tCrud = useTranslations("Crud");

  const [period, setPeriod] = useState<Period>(30);

  const queries = useMemo(
    () =>
      initialData
        .filter((query) => withinDays(query, period))
        .sort((a, b) => (queryDate(b) ?? "").localeCompare(queryDate(a) ?? "")),
    [initialData, period],
  );

  const terms = useMemo(() => aggregateTerms(queries), [queries]);

  const total = queries.length;
  const zero = queries.filter((query) => (query.totalResults ?? 0) === 0).length;
  const results = queries.reduce((acc, query) => acc + (query.totalResults ?? 0), 0);
  const zeroRate = total > 0 ? zero / total : 0;
  const avgResults = total > 0 ? results / total : 0;

  // Términos que nunca devolvieron resultados: oportunidades de catálogo o sinónimos.
  const opportunities = useMemo(() => terms.filter((term) => term.zeroResults === term.count).slice(0, 10), [terms]);

  const columns = useMemo<GridColumn<ISearchQuery>[]>(
    () => [
      {
        id: "query",
        accessorFn: (row) => row.query ?? "",
        header: t("fields.query"),
        meta: { label: t("fields.query"), hideable: false, exportValue: (row) => row.query },
        cell: ({ row }) => <span className='font-semibold text-foreground'>“{row.original.query}”</span>,
      },
      {
        id: "totalResults",
        accessorFn: (row) => row.totalResults ?? 0,
        header: t("fields.totalResults"),
        meta: { label: t("fields.totalResults"), align: "right", exportValue: (row) => row.totalResults ?? 0 },
        cell: ({ row }) => {
          const value = row.original.totalResults ?? 0;
          return <Badge variant={value === 0 ? "destructive" : "secondary"}>{value}</Badge>;
        },
      },
      {
        id: "customerId",
        header: t("fields.customerId"),
        enableSorting: false,
        meta: {
          label: t("fields.customerId"),
          exportValue: (row) => (row.customerId != null ? row.customerId : t("anonymous")),
        },
        cell: ({ row }) => (row.original.customerId != null ? `#${row.original.customerId}` : t("anonymous")),
      },
      {
        id: "sortBy",
        header: t("fields.sortBy"),
        enableSorting: false,
        meta: { label: t("fields.sortBy"), defaultHidden: true, exportValue: (row) => row.sortBy },
        cell: ({ row }) => row.original.sortBy || "—",
      },
      {
        id: "pagination",
        header: t("fields.page"),
        enableSorting: false,
        meta: { label: t("fields.page"), defaultHidden: true },
        cell: ({ row }) => t("pageOf", { page: (row.original.page ?? 0) + 1, size: row.original.pageSize ?? "—" }),
      },
      {
        id: "date",
        accessorFn: (row) => queryDate(row) ?? "",
        header: t("fields.lastRunAt"),
        meta: { label: t("fields.lastRunAt"), exportValue: (row) => queryDate(row) },
        cell: ({ row }) => formatDateTime(queryDate(row.original)),
      },
    ],
    [t],
  );

  const filters: GridFilter<ISearchQuery>[] = [
    {
      id: "results",
      label: t("fields.totalResults"),
      options: [
        { value: "zero", label: t("withoutResults") },
        { value: "some", label: t("withResults") },
      ],
      accessor: (row) => ((row.totalResults ?? 0) === 0 ? "zero" : "some"),
    },
    {
      id: "customer",
      label: t("fields.customerId"),
      options: [
        { value: "anonymous", label: t("anonymous") },
        { value: "registered", label: t("registered") },
      ],
      accessor: (row) => (row.customerId == null ? "anonymous" : "registered"),
    },
  ];

  return (
    <CrudManager<ISearchQuery>
      gridId='busquedas'
      namespace='Administre.searchQuery'
      icon={HiOutlineMagnifyingGlass}
      eyebrow={tCrud("domains.content")}
      data={queries}
      columns={columns}
      filters={filters}
      stats={[
        { label: t("total"), value: total, icon: HiOutlineMagnifyingGlass },
        { label: t("uniqueTerms"), value: terms.length, icon: HiOutlineHashtag },
        {
          label: t("zeroRate"),
          value: `${(zeroRate * 100).toFixed(1)}%`,
          icon: HiOutlineExclamationTriangle,
          tone: zeroRate > 0.2 ? "danger" : zeroRate > 0.1 ? "warning" : "success",
        },
        { label: t("avgResults"), value: avgResults.toFixed(1), icon: HiOutlineQueueList },
      ]}
      rowLabel={(row) => row.query ?? `#${row.id}`}
      searchPlaceholder={t("searchPlaceholder")}
      searchText={(row) => row.query ?? ""}
      onDelete={(id) => deleteSearchQueryServerAction(id)}
      headerActions={
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
      }>
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
                  <span className='shrink-0 text-muted-foreground'>{t("timesSearched", { count: term.count })}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </CrudManager>
  );
};
