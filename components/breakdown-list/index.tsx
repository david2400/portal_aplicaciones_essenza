/** @format */

import type { ReactNode } from "react";

export interface IBreakdownItem {
  key: string;
  label: ReactNode;
  value: number;
  /** Texto secundario a la derecha (p. ej. una tasa). */
  hint?: ReactNode;
}

interface IBreakdownListProps {
  title: ReactNode;
  items: IBreakdownItem[];
  emptyLabel?: ReactNode;
  /** Formatea el valor mostrado; por defecto el número tal cual. */
  formatValue?: (value: number) => ReactNode;
  className?: string;
}

/**
 * Lista de barras horizontales para repartir un total entre categorías.
 * Agnóstica del dominio: sirve para segmentos, tipos, términos, etc.
 */
export const BreakdownList = ({
  title,
  items,
  emptyLabel = "—",
  formatValue = (value) => value,
  className = "",
}: IBreakdownListProps) => {
  const max = Math.max(...items.map((item) => item.value), 0);

  return (
    <div className={`rounded-2xl border border-border bg-card p-5 shadow-sm ${className}`}>
      <h3 className='text-base font-semibold text-foreground'>{title}</h3>
      {items.length === 0 || max === 0 ? (
        <p className='mt-4 text-sm text-muted-foreground'>{emptyLabel}</p>
      ) : (
        <ul className='mt-4 space-y-3'>
          {items.map((item) => (
            <li key={item.key} className='space-y-1'>
              <div className='flex items-baseline justify-between gap-3 text-sm'>
                <span className='min-w-0 truncate font-medium text-foreground'>{item.label}</span>
                <span className='shrink-0 tabular-nums text-muted-foreground'>
                  {formatValue(item.value)}
                  {item.hint != null ? <span className='ml-2 text-xs'>{item.hint}</span> : null}
                </span>
              </div>
              <div className='h-2 overflow-hidden rounded-full bg-muted' aria-hidden='true'>
                <div
                  className='h-full rounded-full bg-primary transition-[width] duration-300'
                  style={{ width: `${(item.value / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
