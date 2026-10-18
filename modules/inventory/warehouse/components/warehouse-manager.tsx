/** @format */

"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Badge } from "@repo/ui/badges/scenes/badge";
import {
  HiOutlineArchiveBox,
  HiOutlineBanknotes,
  HiOutlineCheckCircle,
  HiOutlineCube,
  HiOutlineExclamationTriangle,
  HiOutlineEye,
  HiOutlineMapPin,
  HiOutlinePauseCircle,
  HiOutlinePencilSquare,
  HiOutlinePlusCircle,
  HiOutlineStar,
} from "react-icons/hi2";
import { CrudManager } from "@/components/crud-manager";
import type { GridColumn, GridFilter } from "@/components/data-grid";
import { formatMoney, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Link } from "@/shared/i18n/routing";
import type { PageResult } from "@/shared/models/pagination";
import { WAREHOUSE_TYPES, WAREHOUSES_HREF, MAIN_TYPES, type IWarehouse, type IWarehouseStats, type WarehouseType } from "../models/warehouse.interface";
import { useWarehouseActions } from "../hooks/useWarehouseActions";
import { WarehouseTypeBadge } from "./warehouse-type-badge";
import {
  bulkDeleteWarehousesServerAction,
  deleteWarehouseServerAction,
  exportWarehousesServerAction,
} from "@/app/[locale]/inventory/warehouses/actions";

interface IWarehouseManagerProps {
  page: PageResult<IWarehouse>;
  stats: IWarehouseStats | null;
}

/** Bodegas: búsqueda y filtros en el servidor, existencias valorizadas, ocupación y estado; alta y edición en página propia. */
export const WarehouseManager = ({ page, stats }: IWarehouseManagerProps) => {
  const router = useRouter();
  const t = useTranslations("Administre.warehouse");
  const tTypes = useTranslations("Administre.warehouse.types");
  const tActions = useTranslations("Administre.warehouse.actions");
  const tCommon = useTranslations("Administre.common");
  const tCrud = useTranslations("Crud");
  const { setActive, setMain } = useWarehouseActions();

  const columns = useMemo<GridColumn<IWarehouse>[]>(
    () => [
      {
        id: "name",
        header: t("fields.name"),
        meta: { label: t("fields.name"), hideable: false, exportValue: (row) => row.name },
        cell: ({ row }) => (
          <div className='min-w-0'>
            <div className='flex items-center gap-1.5'>
              <Link href={`${WAREHOUSES_HREF}/${row.original.id}`} className='font-semibold text-foreground underline-offset-4 hover:text-primary hover:underline'>
                {row.original.name ?? "—"}
              </Link>
              {row.original.is_main ? <Badge variant='secondary'>{t("main")}</Badge> : null}
            </div>
            <p className='font-mono text-xs text-muted-foreground'>{row.original.code}</p>
          </div>
        ),
      },
      {
        id: "warehouseType",
        header: t("fields.type"),
        meta: { label: t("fields.type"), exportValue: (row) => (row.warehouse_type ? tTypes(row.warehouse_type as never) : "") },
        cell: ({ row }) => <WarehouseTypeBadge type={row.original.warehouse_type} />,
      },
      {
        id: "city",
        header: t("fields.location"),
        meta: { label: t("fields.location"), exportValue: (row) => [row.address, row.city].filter(Boolean).join(", ") },
        cell: ({ row }) =>
          row.original.city || row.original.address ? (
            <span className='inline-flex items-center gap-1.5'>
              <HiOutlineMapPin className='h-4 w-4 shrink-0 text-muted-foreground' aria-hidden='true' />
              <span className='truncate'>{row.original.city ?? row.original.address}</span>
            </span>
          ) : (
            <span className='text-xs italic text-muted-foreground'>{tCrud("noLocation")}</span>
          ),
      },
      {
        id: "units",
        header: t("fields.units"),
        enableSorting: false,
        meta: { label: t("fields.units"), align: "right", exportValue: (row) => row.units_on_hand },
        cell: ({ row }) => (
          <div className='text-right tabular-nums'>
            <p>{formatNumber(row.original.units_on_hand ?? 0)}</p>
            {(row.original.units_reserved ?? 0) > 0 ? (
              <p className='text-xs text-muted-foreground'>{t("reservedShort", { count: formatNumber(row.original.units_reserved ?? 0) })}</p>
            ) : null}
          </div>
        ),
      },
      {
        id: "value",
        header: t("fields.stockValue"),
        enableSorting: false,
        meta: { label: t("fields.stockValue"), align: "right", exportValue: (row) => row.stock_value },
        cell: ({ row }) => <span className='tabular-nums'>{formatMoney(row.original.stock_value ?? 0)}</span>,
      },
      {
        id: "occupancy",
        header: t("occupancy"),
        enableSorting: false,
        meta: { label: t("occupancy"), exportValue: (row) => row.occupancy_percent },
        cell: ({ row }) => {
          const value = row.original.occupancy_percent;
          if (value == null) return <span className='text-muted-foreground'>—</span>;
          const width = Math.min(100, Math.max(0, value));
          return (
            <div className='flex min-w-24 items-center gap-2'>
              <div className='h-1.5 flex-1 overflow-hidden rounded-full bg-muted' role='presentation'>
                <div className={cn("h-full rounded-full", value > 90 ? "bg-destructive" : value > 75 ? "bg-amber-500" : "bg-emerald-500")}
                  style={{ width: `${width}%` }} />
              </div>
              <span className='w-12 text-right text-xs tabular-nums'>{formatNumber(value)} %</span>
            </div>
          );
        },
      },
      {
        id: "belowMin",
        header: t("fields.belowMin"),
        enableSorting: false,
        meta: { label: t("fields.belowMin"), align: "right", exportValue: (row) => row.below_min_count },
        cell: ({ row }) =>
          (row.original.below_min_count ?? 0) > 0 ? (
            <span className='inline-flex items-center gap-1 text-amber-700 tabular-nums dark:text-amber-400'>
              <HiOutlineExclamationTriangle className='h-4 w-4' aria-hidden='true' />
              {formatNumber(row.original.below_min_count ?? 0)}
            </span>
          ) : (
            <span className='text-muted-foreground'>0</span>
          ),
      },
      {
        id: "active",
        header: t("fields.active"),
        meta: { label: t("fields.active"), exportValue: (row) => (row.active === false ? tCommon("no") : tCommon("yes")) },
        cell: ({ row }) => (
          <Badge variant={row.original.active === false ? "outline" : "default"}>
            {row.original.active === false ? tCommon("inactive") : tCommon("active")}
          </Badge>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, tTypes, tCommon, tCrud],
  );

  const filters: GridFilter<IWarehouse>[] = [
    { id: "warehouseType", label: t("fields.type"), options: WAREHOUSE_TYPES.map((type) => ({ value: type, label: tTypes(type) })) },
    {
      id: "active",
      label: t("fields.active"),
      options: [
        { value: "true", label: tCommon("active") },
        { value: "false", label: tCommon("inactive") },
      ],
    },
  ];

  return (
    <CrudManager<IWarehouse>
      mode='server'
      gridId='bodegas'
      namespace='Administre.warehouse'
      icon={HiOutlineArchiveBox}
      eyebrow={tCrud("domains.inventory")}
      page={page}
      columns={columns}
      filters={filters}
      searchPlaceholder={t("searchPlaceholder")}
      stats={
        stats
          ? [
              {
                label: t("total"),
                value: formatNumber(stats.total ?? 0),
                icon: HiOutlineArchiveBox,
                hint: stats.main_name ? t("mainHint", { name: stats.main_name }) : undefined,
              },
              { label: t("fields.units"), value: formatNumber(stats.units_on_hand ?? 0), icon: HiOutlineCube },
              { label: t("fields.stockValue"), value: formatMoney(stats.stock_value ?? 0), icon: HiOutlineBanknotes },
              {
                label: t("fields.belowMin"),
                value: formatNumber(stats.below_min_count ?? 0),
                icon: HiOutlineExclamationTriangle,
                tone: (stats.below_min_count ?? 0) > 0 ? "warning" : "success",
              },
            ]
          : undefined
      }
      rowLabel={(row) => row.name ?? `#${row.id}`}
      headerActions={
        <Link href={`${WAREHOUSES_HREF}/new`}
          className='inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90'>
          <HiOutlinePlusCircle className='h-4 w-4' aria-hidden='true' />
          {t("create")}
        </Link>
      }
      extraRowActions={(row) => [
        { label: t("view"), icon: HiOutlineEye, onSelect: () => router.push(`${WAREHOUSES_HREF}/${row.id}`) },
        { label: t("edit"), icon: HiOutlinePencilSquare, onSelect: () => router.push(`${WAREHOUSES_HREF}/${row.id}/edit`) },
        ...(!row.is_main && row.active !== false && MAIN_TYPES.includes(row.warehouse_type as WarehouseType)
          ? [{ label: tActions("makeMain"), icon: HiOutlineStar, onSelect: () => setMain(row) }]
          : []),
        ...(row.is_main
          ? []
          : row.active === false
            ? [{ label: tActions("activate"), icon: HiOutlineCheckCircle, onSelect: () => setActive(row, true) }]
            : [{ label: tActions("deactivate"), icon: HiOutlinePauseCircle, onSelect: () => setActive(row, false) }]),
      ]}
      onDelete={(id) => deleteWarehouseServerAction(id)}
      onBulkDelete={(ids) => bulkDeleteWarehousesServerAction(ids)}
      onExportAll={(params) => exportWarehousesServerAction(params)}
    />
  );
};
