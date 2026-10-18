/** @format */

"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Badge } from "@repo/ui/badges/scenes/badge";
import { HiOutlineBuildingStorefront, HiOutlineComputerDesktop, HiOutlineLockOpen, HiOutlinePencilSquare, HiOutlinePlusCircle } from "react-icons/hi2";
import { CrudManager } from "@/components/crud-manager";
import type { GridColumn } from "@/components/data-grid";
import { Link } from "@/shared/i18n/routing";
import { STORES_HREF, type INamedOption, type IStore } from "../models/cash.interface";
import { deleteStoreServerAction } from "@/app/[locale]/ventas/cash-registers/actions";

/** Puntos de venta: bodega de las ventas, cajas y cajas abiertas. */
export const StoreManager = ({ stores, warehouses }: { stores: IStore[]; warehouses: INamedOption[] }) => {
  const t = useTranslations("Administre.cash.store");
  const tCrud = useTranslations("Crud");
  const router = useRouter();
  const warehouseName = (id?: number) => warehouses.find((w) => w.id === id)?.name ?? (id != null ? `#${id}` : "—");

  const columns = useMemo<GridColumn<IStore>[]>(
    () => [
      {
        id: "name",
        accessorFn: (row) => row.name ?? "",
        header: t("fields.name"),
        meta: { label: t("fields.name"), hideable: false, exportValue: (row) => row.name },
        cell: ({ row }) => (
          <Link href={`${STORES_HREF}/${row.original.id}`} className='group flex items-center gap-3'>
            <span className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary'>
              <HiOutlineBuildingStorefront className='h-5 w-5' aria-hidden='true' />
            </span>
            <span>
              <span className='block font-semibold group-hover:underline'>{row.original.name}</span>
              <span className='block font-mono text-xs text-muted-foreground'>{row.original.code}</span>
            </span>
          </Link>
        ),
      },
      {
        id: "location",
        header: t("fields.address"),
        enableSorting: false,
        meta: { label: t("fields.address"), exportValue: (row) => [row.address, row.city].filter(Boolean).join(", ") },
        cell: ({ row }) => (
          <div className='text-sm'>
            <p>{row.original.address ?? "—"}</p>
            <p className='text-xs text-muted-foreground'>{row.original.city}</p>
          </div>
        ),
      },
      {
        id: "warehouse",
        header: t("fields.warehouse"),
        enableSorting: false,
        meta: { label: t("fields.warehouse"), exportValue: (row) => warehouseName(row.warehouse_id) },
        cell: ({ row }) => warehouseName(row.original.warehouse_id),
      },
      {
        id: "registers",
        header: t("fields.registers"),
        enableSorting: false,
        meta: { label: t("fields.registers"), align: "right", exportValue: (row) => row.registers_count },
        cell: ({ row }) => (
          <span className='tabular-nums'>
            {row.original.registers_count ?? 0}
            {(row.original.open_registers ?? 0) > 0 ? (
              <span className='ml-1 text-xs text-emerald-700 dark:text-emerald-400'>{t("openShort", { count: row.original.open_registers ?? 0 })}</span>
            ) : null}
          </span>
        ),
      },
      {
        id: "active",
        header: t("fields.active"),
        enableSorting: false,
        meta: { label: t("fields.active"), exportValue: (row) => (row.active ? t("activeLabel") : t("inactiveLabel")) },
        cell: ({ row }) => <Badge variant={row.original.active ? "default" : "secondary"}>{row.original.active ? t("activeLabel") : t("inactiveLabel")}</Badge>,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, warehouses],
  );

  const open = stores.reduce((sum, s) => sum + (s.open_registers ?? 0), 0);
  const registers = stores.reduce((sum, s) => sum + (s.registers_count ?? 0), 0);

  return (
    <CrudManager<IStore>
      gridId='puntos-venta'
      namespace='Administre.cash.store'
      icon={HiOutlineBuildingStorefront}
      eyebrow={tCrud("domains.sales")}
      data={stores}
      columns={columns}
      stats={[
        { label: t("total"), value: stores.length, icon: HiOutlineBuildingStorefront },
        { label: t("registersTotal"), value: registers, icon: HiOutlineComputerDesktop },
        { label: t("openTotal"), value: open, icon: HiOutlineLockOpen, tone: open > 0 ? "success" : "default" },
      ]}
      rowLabel={(row) => row.name ?? `#${row.id}`}
      searchPlaceholder={t("searchPlaceholder")}
      searchText={(row) => `${row.name ?? ""} ${row.code ?? ""} ${row.city ?? ""}`}
      headerActions={
        <Link href={`${STORES_HREF}/new`}
          className='inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90'>
          <HiOutlinePlusCircle className='h-4 w-4' aria-hidden='true' />
          {t("create")}
        </Link>
      }
      extraRowActions={(row) => [
        { label: t("edit"), icon: HiOutlinePencilSquare, onSelect: () => router.push(`${STORES_HREF}/${row.id}`) },
      ]}
      onDelete={(id) => deleteStoreServerAction(id)}
    />
  );
};
