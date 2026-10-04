/** @format */

"use client";

import { useTranslations } from "next-intl";
import { Buttons } from "@repo/ui/buttons/scenes";
import {
  HiChevronDoubleLeft,
  HiChevronDoubleRight,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi2";
import { PAGE_SIZE_OPTIONS } from "@/shared/models/pagination";
import type { GridPagination as Pagination } from "./types";

interface GridPaginationProps {
  pagination: Pagination;
  onPage: (page: number) => void;
  onSize: (size: number) => void;
  selected?: number;
}

const numberFormat = new Intl.NumberFormat("es-CO");

export function GridPagination({ pagination, onPage, onSize, selected = 0 }: GridPaginationProps) {
  const t = useTranslations("Grid");
  const { page, size, total, totalPages } = pagination;
  const lastPage = Math.max(totalPages - 1, 0);
  const from = total === 0 ? 0 : page * size + 1;
  const to = Math.min((page + 1) * size, total);

  return (
    <nav
      aria-label={t("pagination")}
      className='flex flex-col gap-3 border-t border-border/70 px-1 pt-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between'>
      <p aria-live='polite'>
        {t("showing", { from: numberFormat.format(from), to: numberFormat.format(to), total: numberFormat.format(total) })}
        {selected > 0 ? <span className='ml-2 font-medium text-foreground'>· {t("selectedCount", { count: selected })}</span> : null}
      </p>

      <div className='flex flex-wrap items-center gap-3'>
        <label className='flex items-center gap-2'>
          <span>{t("rowsPerPage")}</span>
          <select
            value={size}
            onChange={(event) => onSize(Number(event.target.value))}
            className='h-8 rounded-lg border border-border/70 bg-background px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30'>
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <span className='tabular-nums'>{t("pageOf", { page: page + 1, pages: Math.max(totalPages, 1) })}</span>

        <div className='flex items-center gap-1'>
          <Buttons variant='outline' size='icon-sm' onClick={() => onPage(0)} disabled={page <= 0} aria-label={t("first")}>
            <HiChevronDoubleLeft className='h-4 w-4' aria-hidden='true' />
          </Buttons>
          <Buttons variant='outline' size='icon-sm' onClick={() => onPage(page - 1)} disabled={page <= 0} aria-label={t("previous")}>
            <HiChevronLeft className='h-4 w-4' aria-hidden='true' />
          </Buttons>
          <Buttons variant='outline' size='icon-sm' onClick={() => onPage(page + 1)} disabled={page >= lastPage} aria-label={t("next")}>
            <HiChevronRight className='h-4 w-4' aria-hidden='true' />
          </Buttons>
          <Buttons variant='outline' size='icon-sm' onClick={() => onPage(lastPage)} disabled={page >= lastPage} aria-label={t("last")}>
            <HiChevronDoubleRight className='h-4 w-4' aria-hidden='true' />
          </Buttons>
        </div>
      </div>
    </nav>
  );
}
