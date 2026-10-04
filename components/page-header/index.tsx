/** @format */

import type { ComponentType, ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" }>;
  /** Texto pequeño sobre el título (dominio o sección). */
  eyebrow?: string;
  /** Botones de acción alineados a la derecha. */
  actions?: ReactNode;
}

/**
 * Encabezado estándar de los módulos: icono, título (h2), descripción y
 * acciones. Mantiene la misma jerarquía visual en todas las pantallas.
 */
export const PageHeader = ({ title, description, icon: Icon, eyebrow, actions }: PageHeaderProps) => (
  <header className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
    <div className='flex min-w-0 items-center gap-4'>
      {Icon ? (
        <div className='shrink-0 rounded-2xl bg-primary/10 p-3 ring-1 ring-primary/15'>
          <Icon className='h-7 w-7 text-primary' aria-hidden='true' />
        </div>
      ) : null}
      <div className='min-w-0'>
        {eyebrow ? (
          <p className='text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground'>{eyebrow}</p>
        ) : null}
        <h2 className='truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl'>{title}</h2>
        {description ? <p className='mt-1 text-sm text-muted-foreground sm:text-base'>{description}</p> : null}
      </div>
    </div>
    {actions ? <div className='flex shrink-0 flex-wrap items-center gap-2'>{actions}</div> : null}
  </header>
);
