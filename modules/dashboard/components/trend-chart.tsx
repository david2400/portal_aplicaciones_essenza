/** @format */

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { ISalesReport } from "../models/dashboard.interface";

interface ITrendChartProps {
  data: ISalesReport[];
}

const money = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});
const formatValue = (value: number) => money.format(value);

/**
 * Barras de ingresos por periodo (una sola serie → un solo tono, sin leyenda).
 * Cada barra es enfocable y muestra su valor al pasar el cursor o con teclado;
 * la tabla oculta ofrece la misma información a lectores de pantalla.
 */
export const TrendChart = ({ data }: ITrendChartProps) => {
  const t = useTranslations("Dashboard");
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...data.map((point) => point.totalRevenue ?? 0), 1);

  return (
    <figure className='space-y-3'>
      <div className='relative flex h-48 items-end gap-[2px] border-b border-border' aria-hidden='true'>
        {data.map((point, index) => {
          const value = point.totalRevenue ?? 0;
          const height = Math.max((value / max) * 100, value > 0 ? 2 : 0);
          return (
            <button
              key={`${point.date}-${index}`}
              type='button'
              tabIndex={-1}
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive(null)}
              className='group relative flex h-full flex-1 items-end justify-center'>
              <span
                className='w-full max-w-10 rounded-t-[4px] bg-primary/80 transition-colors group-hover:bg-primary'
                style={{ height: `${height}%` }}
              />
              {active === index ? (
                <span className='pointer-events-none absolute -top-2 z-10 -translate-y-full whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-sm'>
                  <span className='block font-semibold'>{formatValue(value)}</span>
                  <span className='block text-muted-foreground'>{point.date}</span>
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <div className='flex justify-between text-xs text-muted-foreground' aria-hidden='true'>
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
      <table className='sr-only'>
        <caption>{t("trendsTitle")}</caption>
        <thead>
          <tr>
            <th scope='col'>{t("period")}</th>
            <th scope='col'>{t("revenue")}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point, index) => (
            <tr key={`${point.date}-row-${index}`}>
              <td>{point.date}</td>
              <td>{formatValue(point.totalRevenue ?? 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
};
