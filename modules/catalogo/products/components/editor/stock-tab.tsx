/** @format */

"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@repo/ui/badges/scenes/badge";
import {
  HiOutlineArchiveBox,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineExclamationTriangle,
  HiOutlineInformationCircle,
} from "react-icons/hi2";
import { DataGrid, type GridColumn } from "@/components/data-grid";
import { StatCards } from "@/components/stat-cards";
import { formatApiDate, formatNumber } from "@/lib/format";
import { Link } from "@/shared/i18n/routing";
import type { IProduct } from "../../models/product.interface";
import type { INamedItem, IStockLevel, IStockReservation } from "../../models/product-editor.interface";

type LevelRow = IStockLevel & { skuLabel: string; skuCode?: string; warehouse: string };

/** Existencias por SKU y bodega, y reservas activas de órdenes pendientes (solo lectura). */
export const StockTab = ({
  product,
  levels,
  reservations,
  warehouses,
}: {
  product: IProduct;
  levels: IStockLevel[];
  reservations: IStockReservation[];
  warehouses: INamedItem[];
}) => {
  const t = useTranslations("Administre.productEditor");
  const tReservation = useTranslations("Administre.order.reservationStatus");

  const skuById = useMemo(() => new Map((product.skus ?? []).map((sku) => [sku.id ?? -1, sku])), [product.skus]);
  const warehouseById = useMemo(() => new Map(warehouses.map((w) => [w.id ?? -1, w.name ?? `#${w.id}`])), [warehouses]);
  const skuLabel = (skuId?: number) => {
    const sku = skuById.get(skuId ?? -1);
    if (!sku) return `#${skuId}`;
    return sku.variant_id != null ? (sku.name ?? sku.code ?? `#${skuId}`) : (product.name ?? sku.code ?? `#${skuId}`);
  };

  const rows = useMemo<LevelRow[]>(
    () =>
      levels.map((level) => ({
        ...level,
        skuLabel: skuLabel(level.sku_id),
        skuCode: skuById.get(level.sku_id ?? -1)?.code,
        warehouse: warehouseById.get(level.warehouse_id ?? -1) ?? `#${level.warehouse_id}`,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [levels, skuById, warehouseById],
  );

  const totals = levels.reduce<{ onHand: number; reserved: number; available: number; low: number }>(
    (acc, level) => ({
      onHand: acc.onHand + (level.on_hand ?? 0),
      reserved: acc.reserved + (level.reserved ?? 0),
      available: acc.available + (level.available ?? 0),
      low: acc.low + (level.below_threshold ? 1 : 0),
    }),
    { onHand: 0, reserved: 0, available: 0, low: 0 },
  );

  const columns = useMemo<GridColumn<LevelRow>[]>(
    () => [
      {
        id: "sku",
        accessorFn: (row) => row.skuLabel,
        header: t("sku"),
        meta: { label: t("sku"), hideable: false, exportValue: (row) => row.skuCode },
        cell: ({ row }) => (
          <div className='min-w-0'>
            <p className='truncate font-medium text-foreground'>{row.original.skuLabel}</p>
            <p className='font-mono text-xs text-muted-foreground'>{row.original.skuCode ?? ""}</p>
          </div>
        ),
      },
      {
        id: "warehouse",
        accessorFn: (row) => row.warehouse,
        header: t("warehouse"),
        meta: { label: t("warehouse"), exportValue: (row) => row.warehouse },
      },
      {
        id: "on_hand",
        accessorFn: (row) => row.on_hand ?? 0,
        header: t("onHand"),
        meta: { label: t("onHand"), align: "right", exportValue: (row) => row.on_hand },
        cell: ({ row }) => <span className='tabular-nums'>{formatNumber(row.original.on_hand ?? 0)}</span>,
      },
      {
        id: "reserved",
        accessorFn: (row) => row.reserved ?? 0,
        header: t("reserved"),
        meta: { label: t("reserved"), align: "right", exportValue: (row) => row.reserved },
        cell: ({ row }) => <span className='tabular-nums text-muted-foreground'>{formatNumber(row.original.reserved ?? 0)}</span>,
      },
      {
        id: "available",
        accessorFn: (row) => row.available ?? 0,
        header: t("availableUnits"),
        meta: { label: t("availableUnits"), align: "right", exportValue: (row) => row.available },
        cell: ({ row }) => (
          <span className='inline-flex items-center gap-1.5 font-semibold tabular-nums'>
            {row.original.below_threshold ? (
              <HiOutlineExclamationTriangle className='h-4 w-4 text-warning' aria-label={t("belowThreshold")} />
            ) : null}
            {formatNumber(row.original.available ?? 0)}
          </span>
        ),
      },
      {
        id: "min_threshold",
        accessorFn: (row) => row.min_threshold ?? 0,
        header: t("minThreshold"),
        meta: { label: t("minThreshold"), align: "right", defaultHidden: true, exportValue: (row) => row.min_threshold },
        cell: ({ row }) => <span className='tabular-nums'>{formatNumber(row.original.min_threshold ?? 0)}</span>,
      },
    ],
    [t],
  );

  return (
    <div className='space-y-6'>
      <StatCards
        items={[
          { label: t("onHand"), value: formatNumber(totals.onHand), icon: HiOutlineArchiveBox },
          { label: t("reserved"), value: formatNumber(totals.reserved), icon: HiOutlineClock, tone: totals.reserved > 0 ? "warning" : undefined },
          {
            label: t("availableUnits"),
            value: formatNumber(totals.available),
            icon: HiOutlineCheckCircle,
            tone: totals.available > 0 ? "success" : "danger",
            hint: totals.low > 0 ? t("lowStockRows", { count: totals.low }) : undefined,
          },
        ]}
      />

      <div className='flex gap-2 rounded-xl border border-border bg-muted/30 p-3 text-sm' role='note'>
        <HiOutlineInformationCircle className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground' aria-hidden='true' />
        <p>
          {t("stockHint")}{" "}
          <Link href='/inventory/inventory-movements' className='font-medium text-primary underline-offset-4 hover:underline'>
            {t("goToKardex")}
          </Link>
        </p>
      </div>

      <DataGrid<LevelRow>
        mode='client'
        embedded
        id='product-stock'
        caption={t("tabs.stock")}
        data={rows}
        columns={columns}
        getRowId={(row) => String(row.id ?? `${row.sku_id}-${row.warehouse_id}`)}
        searchText={(row) => `${row.skuLabel} ${row.skuCode ?? ""} ${row.warehouse}`}
        emptyState={{ title: t("noStockTitle"), description: t("noStockDescription") }}
      />

      <section className='space-y-3'>
        <div>
          <h3 className='text-base font-semibold text-foreground'>{t("activeReservations")}</h3>
          <p className='text-sm text-muted-foreground'>{t("activeReservationsHint")}</p>
        </div>
        {reservations.length === 0 ? (
          <p className='text-sm text-muted-foreground'>{t("noReservations")}</p>
        ) : (
          <div className='overflow-x-auto rounded-xl border border-border'>
            <table className='w-full text-sm'>
              <thead className='bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground'>
                <tr>
                  <th className='px-3 py-2'>{t("order")}</th>
                  <th className='px-3 py-2'>{t("sku")}</th>
                  <th className='px-3 py-2'>{t("warehouse")}</th>
                  <th className='px-3 py-2 text-right'>{t("quantity")}</th>
                  <th className='px-3 py-2'>{t("status")}</th>
                  <th className='px-3 py-2'>{t("expiresAt")}</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => (
                  <tr key={reservation.id} className='border-t border-border'>
                    <td className='px-3 py-2'>
                      <Link href={`/ventas/orders/${reservation.order_id}`} className='font-medium text-primary underline-offset-4 hover:underline'>
                        #{reservation.order_id}
                      </Link>
                    </td>
                    <td className='px-3 py-2'>{skuLabel(reservation.sku_id)}</td>
                    <td className='px-3 py-2'>{warehouseById.get(reservation.warehouse_id ?? -1) ?? `#${reservation.warehouse_id}`}</td>
                    <td className='px-3 py-2 text-right tabular-nums'>{formatNumber(reservation.quantity)}</td>
                    <td className='px-3 py-2'>
                      <Badge variant='secondary'>{reservation.status ? tReservation(reservation.status) : "—"}</Badge>
                    </td>
                    <td className='px-3 py-2 text-muted-foreground'>{formatApiDate(reservation.expires_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
