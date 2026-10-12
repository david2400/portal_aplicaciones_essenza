/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { HiOutlineArrowLeft, HiOutlinePlusCircle } from "react-icons/hi2";
import { PageHeader } from "@/components/page-header";
import { Link } from "@/shared/i18n/routing";
import { cn } from "@/lib/utils";
import type { IUnit } from "@/shared/units/units";
import { RegisterProduct } from "../components/form";
import type { ProductKind } from "./formProduct";

/** Pestaña del editor en la que se continúa según el tipo elegido. */
const NEXT_TAB: Record<ProductKind, string> = {
  SIMPLE: "specs",
  VARIANT: "variants",
  COMBO: "combo",
};

/**
 * Alta de producto en su propia ruta (`/catalogo/products/new`): encabezado, pasos del
 * proceso (datos generales → ficha técnica → variantes e imágenes) y el formulario por
 * secciones. Al crear se continúa en el editor, en la pestaña que corresponde al tipo.
 */
export const ProductCreate = ({ units = [] }: { units?: IUnit[] }) => {
  const router = useRouter();
  const t = useTranslations("Administre.product");
  const tEditor = useTranslations("Administre.productEditor");

  const steps = [
    { id: "general", label: tEditor("steps.general"), hint: tEditor("steps.generalHint") },
    { id: "specs", label: tEditor("steps.specs"), hint: tEditor("steps.specsHint") },
    { id: "more", label: tEditor("steps.more"), hint: tEditor("steps.moreHint") },
  ];

  return (
    <section className='flex w-full flex-col gap-6'>
      <Link
        href='/catalogo/products'
        className='inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground'>
        <HiOutlineArrowLeft className='h-4 w-4' aria-hidden='true' />
        {tEditor("back")}
      </Link>

      <PageHeader title={t("createTitle")} description={tEditor("createDescription")} icon={HiOutlinePlusCircle} eyebrow={tEditor("eyebrow")} />

      <ol aria-label={tEditor("steps.label")} className='grid gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm sm:grid-cols-3'>
        {steps.map((step, index) => {
          const current = index === 0;
          return (
            <li
              key={step.id}
              aria-current={current ? "step" : undefined}
              className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5", current ? "bg-primary/10" : "opacity-70")}>
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  current ? "bg-primary text-primary-foreground" : "border border-border bg-background text-muted-foreground",
                )}>
                {index + 1}
              </span>
              <span className='min-w-0'>
                <span className={cn("block text-sm font-semibold", current ? "text-foreground" : "text-muted-foreground")}>{step.label}</span>
                <span className='block truncate text-xs text-muted-foreground'>{step.hint}</span>
              </span>
            </li>
          );
        })}
      </ol>

      <RegisterProduct
        units={units}
        onCreated={(id, kind) => router.replace(`/catalogo/products/${id}?tab=${NEXT_TAB[kind]}`)}
      />
    </section>
  );
};
