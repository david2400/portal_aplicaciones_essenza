/** @format */

import type { ComponentType, ReactNode } from "react";
import { cn } from "@repo/ui/utils";

export interface StatCardItem {
  label: string;
  value: ReactNode;
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" }>;
  /** Texto de apoyo bajo el valor (contexto, comparación…). */
  hint?: ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
}

const TONE: Record<NonNullable<StatCardItem["tone"]>, string> = {
  default: "text-primary bg-primary/10",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/15",
  danger: "text-destructive bg-destructive/10",
};

/**
 * Fila de indicadores (KPI). Es una lista de definiciones (`dl`) para que
 * los lectores de pantalla asocien cada valor con su etiqueta.
 */
export const StatCards = ({ items, className }: { items: StatCardItem[]; className?: string }) => (
  <dl
    className={cn(
      "grid gap-4",
      items.length >= 4 ? "sm:grid-cols-2 xl:grid-cols-4" : items.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2",
      className,
    )}>
    {items.map(({ label, value, icon: Icon, hint, tone = "default" }) => (
      <div
        key={label}
        className='rounded-xl border border-border/70 bg-background/60 p-4'>
        <div className='flex items-start justify-between gap-3'>
          <dt className='text-sm font-medium text-muted-foreground'>{label}</dt>
          {Icon ? (
            <span className={cn("rounded-xl p-2", TONE[tone])}>
              <Icon className='h-4 w-4' aria-hidden='true' />
            </span>
          ) : null}
        </div>
        <dd className='mt-2 text-2xl font-semibold tabular-nums tracking-tight text-foreground'>{value}</dd>
        {hint ? <dd className='mt-1 text-xs text-muted-foreground'>{hint}</dd> : null}
      </div>
    ))}
  </dl>
);
