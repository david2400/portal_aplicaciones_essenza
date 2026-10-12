/** @format */

"use client";

import type { ComponentType, ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs/scenes/tabs";
import { HiOutlineArrowLeft, HiOutlineInformationCircle } from "react-icons/hi2";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Link } from "@/shared/i18n/routing";
import type { EditorTab } from "../../models/product-editor.interface";

type IconType = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" }>;

export interface EditorTabItem {
  id: EditorTab;
  label: string;
  /** Icono de la pestaña. */
  icon?: IconType;
  count?: number;
  disabled?: boolean;
  /** Punto de aviso (p. ej. sin imágenes, sin stock) y su explicación. */
  alert?: "warn" | "danger";
  alertLabel?: string;
}

interface ProductEditorLayoutProps {
  title: string;
  description?: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" }>;
  actions?: ReactNode;
  tabs: EditorTabItem[];
  tab: EditorTab;
  onTabChange?: (tab: string) => void;
  /** Aviso bajo las pestañas (p. ej. "guarda para habilitar el resto"). */
  notice?: string;
  /** Contenido: los `TabsContent` del editor o el formulario de alta. */
  children: ReactNode;
  /** Resumen bajo el encabezado (indicadores del producto). */
  summary?: ReactNode;
  /** Sin tarjeta contenedora (el contenido ya trae sus propias tarjetas, p. ej. "General"). */
  plain?: boolean;
}

/**
 * Estructura común del alta y del editor de producto: volver, encabezado,
 * pestañas y una tarjeta con el contenido. Así crear y editar se ven igual.
 */
export const ProductEditorLayout = ({
  title,
  description,
  icon,
  actions,
  tabs,
  tab,
  onTabChange,
  notice,
  children,
  plain = false,
  summary,
}: ProductEditorLayoutProps) => {
  const t = useTranslations("Administre.productEditor");

  return (
    <section className='flex w-full flex-col gap-6 [--sticky-offset:8.75rem]'>
      <Link
        href='/catalogo/products'
        className='inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground'>
        <HiOutlineArrowLeft className='h-4 w-4' aria-hidden='true' />
        {t("back")}
      </Link>

      <PageHeader title={title} description={description} icon={icon} eyebrow={t("eyebrow")} actions={actions} />

      {summary}

      <Tabs value={tab} onValueChange={onTabChange} className='gap-5'>
        <div className='flex flex-col gap-2'>
          {/* Barra fija al hacer scroll, con desplazamiento horizontal en pantallas angostas. */}
          <div className='sticky top-16 z-30 -mx-1 px-1 pt-1'>
            <div className='relative overflow-hidden rounded-2xl border border-border bg-card/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80'>
              <div className='overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                <TabsList
                  aria-label={t("tabsLabel")}
                  className='flex h-auto w-max min-w-full justify-start gap-1 rounded-none border-0 bg-transparent p-1.5 shadow-none backdrop-blur-none'>
                  {tabs.map((item) => {
                    const Icon = item.icon;
                    const active = item.id === tab;
                    return (
                      <TabsTrigger
                        key={item.id}
                        value={item.id}
                        disabled={item.disabled}
                        title={item.disabled ? notice : item.alertLabel}
                        className={cn(
                          "group relative h-10 min-w-0 flex-none gap-2 rounded-xl border-0 px-3.5 text-sm font-medium",
                          "data-[state=active]:translate-y-0 data-[state=active]:border-0 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none",
                          "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted data-[state=inactive]:hover:text-foreground",
                          "after:absolute after:inset-x-3 after:-bottom-1.5 after:h-0.5 after:rounded-full after:bg-primary after:opacity-0 after:transition-opacity data-[state=active]:after:opacity-100",
                        )}>
                        {Icon ? (
                          <span className='relative'>
                            <Icon
                              className={cn("h-4 w-4 transition-colors", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}
                              aria-hidden='true'
                            />
                            {item.alert ? (
                              <span
                                className={cn(
                                  "absolute -right-1 -top-1 h-2 w-2 rounded-full ring-2 ring-card",
                                  item.alert === "danger" ? "bg-destructive" : "bg-amber-500",
                                )}
                                aria-hidden='true'
                              />
                            ) : null}
                          </span>
                        ) : null}
                        <span className='whitespace-nowrap'>{item.label}</span>
                        {item.count != null ? (
                          <span
                            className={cn(
                              "min-w-5 rounded-full px-1.5 py-px text-center text-[11px] font-semibold tabular-nums",
                              active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                            )}>
                            {item.count}
                          </span>
                        ) : null}
                        {item.alert && item.alertLabel ? <span className='sr-only'>{`(${item.alertLabel})`}</span> : null}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>
              {/* Degradado que insinúa más pestañas al desplazar. */}
              <span className='pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-card to-transparent sm:hidden' aria-hidden='true' />
            </div>
          </div>
          {notice ? (
            <p className='flex items-center gap-1.5 text-sm text-muted-foreground'>
              <HiOutlineInformationCircle className='h-4 w-4 shrink-0' aria-hidden='true' />
              {notice}
            </p>
          ) : null}
        </div>

        <div className={plain ? undefined : "rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6"}>{children}</div>
      </Tabs>
    </section>
  );
};
