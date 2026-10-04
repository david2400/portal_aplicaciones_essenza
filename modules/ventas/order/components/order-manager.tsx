/** @format */

"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  HiOutlineBanknotes,
  HiOutlineClock,
  HiOutlineEye,
  HiOutlineReceiptPercent,
  HiOutlineShoppingBag,
} from "react-icons/hi2";
import { CrudManager } from "@/components/crud-manager";
import type { GridColumn, GridFilter } from "@/components/data-grid";
import { formatApiDate, formatMoney, formatNumber } from "@/lib/format";
import { Link } from "@/shared/i18n/routing";
import type { PageResult } from "@/shared/models/pagination";
import { RegisterOrder, UpdateOrder } from "./form";
import { OrderStatusBadge } from "./order-status-badge";
import { ORDER_STATES } from "../constants";
import type { IOrder, IOrderItem } from "../models/order.interface";
import type { OrderStats } from "../stats";
import {
  bulkDeleteOrdersServerAction,
  deleteOrderServerAction,
  exportOrdersServerAction,
} from "@/app/[locale]/ventas/orders/actions";

interface IOrderManagerProps {
  page: PageResult<IOrder>;
  stats: OrderStats;
  items: IOrderItem[];
}

/** Órdenes: búsqueda y filtros en el servidor, detalle por orden, lote y CSV. */
export const OrderManager = ({ page, stats, items }: IOrderManagerProps) => {
  const router = useRouter();
  const t = useTranslations("Administre.order");
  const tStates = useTranslations("Administre.order.states");
  const tCrud = useTranslations("Crud");

  const unitsByOrder = useMemo(() => {
    const counts = new Map<number, number>();
    items.forEach((item) => {
      if (item.orderId == null) return;
      counts.set(item.orderId, (counts.get(item.orderId) ?? 0) + (item.quantity ?? 0));
    });
    return counts;
  }, [items]);

  const label = (row: IOrder) => t("orderLabel", { id: row.id ?? "—" });

  const columns = useMemo<GridColumn<IOrder>[]>(
    () => [
      {
        id: "id",
        header: t("fields.id"),
        meta: { label: t("fields.id"), hideable: false, exportValue: (row) => row.id },
        cell: ({ row }) => (
          <Link
            href={`/ventas/orders/${row.original.id}`}
            className='font-semibold text-primary underline-offset-4 hover:underline'>
            {label(row.original)}
          </Link>
        ),
      },
      {
        id: "state",
        header: t("fields.state"),
        meta: { label: t("fields.state"), exportValue: (row) => row.state },
        cell: ({ row }) => <OrderStatusBadge state={row.original.state} />,
      },
      {
        id: "units",
        header: t("fields.units"),
        enableSorting: false,
        meta: { label: t("fields.units"), align: "right", exportValue: (row) => unitsByOrder.get(row.id ?? -1) ?? 0 },
        cell: ({ row }) => <span className='tabular-nums'>{formatNumber(unitsByOrder.get(row.original.id ?? -1) ?? 0)}</span>,
      },
      {
        id: "total",
        header: t("fields.total"),
        meta: { label: t("fields.total"), align: "right", exportValue: (row) => row.total },
        cell: ({ row }) => <span className='font-medium tabular-nums'>{formatMoney(row.original.total)}</span>,
      },
      {
        id: "complementaryOrder",
        header: t("fields.complementaryOrder"),
        enableSorting: false,
        meta: { label: t("fields.complementaryOrder"), exportValue: (row) => row.complementaryOrder },
        cell: ({ row }) => row.original.complementaryOrder || "—",
      },
      {
        id: "createdAt",
        header: tCrud("createdAt"),
        meta: { label: tCrud("createdAt"), exportValue: (row) => formatApiDate(row.createdAt) },
        cell: ({ row }) => <span className='whitespace-nowrap text-muted-foreground'>{formatApiDate(row.original.createdAt)}</span>,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unitsByOrder, t, tCrud],
  );

  const filters: GridFilter<IOrder>[] = [
    { id: "state", label: t("fields.state"), options: ORDER_STATES.map((state) => ({ value: state, label: tStates(state) })) },
  ];

  return (
    <CrudManager<IOrder>
      mode='server'
      gridId='ordenes'
      namespace='Administre.order'
      icon={HiOutlineShoppingBag}
      eyebrow={tCrud("domains.sales")}
      page={page}
      columns={columns}
      filters={filters}
      searchPlaceholder={t("searchPlaceholder")}
      stats={[
        { label: t("total"), value: formatNumber(stats.total), icon: HiOutlineShoppingBag },
        { label: t("revenue"), value: formatMoney(stats.revenue), icon: HiOutlineBanknotes, tone: "success", hint: t("revenueHint") },
        {
          label: t("pending"),
          value: formatNumber(stats.pending),
          icon: HiOutlineClock,
          tone: stats.pending > 0 ? "warning" : "success",
        },
        { label: t("averageTicket"), value: formatMoney(stats.averageTicket), icon: HiOutlineReceiptPercent },
      ]}
      rowLabel={label}
      extraRowActions={(row) => [
        { label: t("viewDetail"), icon: HiOutlineEye, onSelect: () => router.push(`/ventas/orders/${row.id}`) },
      ]}
      renderForm={(item, close) =>
        item ? <UpdateOrder order={item} handleClose={close} /> : <RegisterOrder handleClose={close} />
      }
      onDelete={(id) => deleteOrderServerAction(id)}
      onBulkDelete={(ids) => bulkDeleteOrdersServerAction(ids)}
      onExportAll={(params) => exportOrdersServerAction(params)}
    />
  );
};
