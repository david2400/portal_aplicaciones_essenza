/** @format */

"use client";

import type { ComponentType, ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs/scenes/tabs";
import { HiOutlineArrowLeft, HiOutlineInformationCircle } from "react-icons/hi2";
import { PageHeader } from "@/components/page-header";
import { Link } from "@/shared/i18n/routing";
import type { EditorTab } from "../../models/product-editor.interface";

export interface EditorTabItem {
  id: EditorTab;
  label: string;
  count?: number;
  disabled?: boolean;
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
}: ProductEditorLayoutProps) => {
  const t = useTranslations("Administre.productEditor");

  return (
    <section className='flex w-full flex-col gap-6'>
      <Link
        href='/catalogo/products'
        className='inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground'>
        <HiOutlineArrowLeft className='h-4 w-4' aria-hidden='true' />
        {t("back")}
      </Link>

      <PageHeader title={title} description={description} icon={icon} eyebrow={t("eyebrow")} actions={actions} />

      <Tabs value={tab} onValueChange={onTabChange} className='gap-5'>
        <div className='flex flex-col gap-2'>
          <div className='overflow-x-auto'>
            <TabsList aria-label={t("tabsLabel")}>
              {tabs.map((item) => (
                <TabsTrigger key={item.id} value={item.id} disabled={item.disabled} title={item.disabled ? notice : undefined}>
                  {item.label}
                  {item.count != null ? (
                    <span className='ml-1.5 rounded-full bg-muted px-1.5 text-xs tabular-nums text-muted-foreground'>{item.count}</span>
                  ) : null}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {notice ? (
            <p className='flex items-center gap-1.5 text-sm text-muted-foreground'>
              <HiOutlineInformationCircle className='h-4 w-4 shrink-0' aria-hidden='true' />
              {notice}
            </p>
          ) : null}
        </div>

        <div className='rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6'>{children}</div>
      </Tabs>
    </section>
  );
};
