/** @format */

"use client";

import { useTranslations } from "next-intl";
import { useGridUrl } from "@/components/data-grid";

const inputClass =
  "h-9 rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Rango de fechas (día de Bogotá) guardado en la URL del listado como `from` / `to`. */
export const DateRangeFilter = () => {
  const t = useTranslations("Crud.dateRange");
  const grid = useGridUrl();
  const from = grid.get("from");
  const to = grid.get("to");
  return (
    <div className='flex flex-wrap items-center gap-2' role='group' aria-label={t("label")}>
      <label className='flex items-center gap-1.5 text-xs text-muted-foreground'>
        {t("from")}
        <input
          type='date'
          className={inputClass}
          value={from}
          max={to || undefined}
          onChange={(event) => grid.update({ from: event.target.value || null })}
        />
      </label>
      <label className='flex items-center gap-1.5 text-xs text-muted-foreground'>
        {t("to")}
        <input
          type='date'
          className={inputClass}
          value={to}
          min={from || undefined}
          onChange={(event) => grid.update({ to: event.target.value || null })}
        />
      </label>
      {from || to ? (
        <button
          type='button'
          className='text-xs font-medium text-primary underline-offset-4 hover:underline'
          onClick={() => grid.update({ from: null, to: null })}>
          {t("clear")}
        </button>
      ) : null}
    </div>
  );
};
