/** @format */

"use client";

import { useTranslations } from "next-intl";
import { isWarehouseType } from "../models/warehouse.interface";

const TONE: Record<string, string> = {
  ALMACEN: "bg-sky-50 text-sky-800 ring-sky-600/20 dark:bg-sky-950 dark:text-sky-300",
  TIENDA: "bg-violet-50 text-violet-800 ring-violet-600/20 dark:bg-violet-950 dark:text-violet-300",
  TRANSITO: "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-950 dark:text-amber-300",
  DEVOLUCIONES: "bg-rose-50 text-rose-800 ring-rose-600/20 dark:bg-rose-950 dark:text-rose-300",
  CONSIGNACION: "bg-emerald-50 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-300",
};

export const WarehouseTypeBadge = ({ type }: { type?: string }) => {
  const t = useTranslations("Administre.warehouse.types");
  if (!isWarehouseType(type)) return <span className='text-xs text-muted-foreground'>{type ?? "—"}</span>;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TONE[type]}`}>
      {t(type)}
    </span>
  );
};
