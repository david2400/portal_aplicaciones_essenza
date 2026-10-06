/** @format */

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { confirm, notify, prompt } from "@/components/notifications";
import { Modal } from "@repo/ui/modals/scenes/dialog/modal";
import { Buttons } from "@repo/ui/buttons/scenes";
import { Badge } from "@repo/ui/badges/scenes/badge";
import {
  HiOutlineArrowLeft,
  HiOutlineInformationCircle,
  HiOutlinePencilSquare,
  HiOutlinePlusCircle,
  HiOutlineTrash,
} from "react-icons/hi2";
import { DataGrid, type GridColumn, type RowAction } from "@/components/data-grid";
import { StatCards } from "@/components/stat-cards";
import { Link } from "@/shared/i18n/routing";
import { OrderItemForm, UpdateOrder } from "./form";
import { OrderStatusBadge } from "./order-status-badge";
import { ORDER_STATES, formatMoney, isOrderState, type OrderState } from "../constants";
import type { INamedItem, IOrder, IOrderItem, IOrderReservation, IOrderSku } from "../models/order.interface";
import {
  changeOrderStatusServerAction,
  deleteOrderItemServerAction,
} from "@/app/[locale]/ventas/orders/actions";

interface IOrderDetailProps {
  order: IOrder;
  items: IOrderItem[];
  skus: IOrderSku[];
  reservations: IOrderReservation[];
  warehouses: INamedItem[];
}

const RESERVATION_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ACTIVE: "secondary",
  COMMITTED: "default",
  RELEASED: "outline",
  EXPIRED: "destructive",
  RETURNED: "outline",
};

/**
 * Detalle de una orden: líneas por SKU con precio congelado, reservas de stock y
 * cambios de estado (pagar descuenta el stock; cancelar lo libera o lo devuelve).
 */
export const OrderDetail = ({ order, items, skus, reservations, warehouses }: IOrderDetailProps) => {
  const router = useRouter();
  const t = useTranslations("Administre.order");
  const tItems = useTranslations("Administre.order.items");
  const tStates = useTranslations("Administre.order.states");
  const tCommon = useTranslations("Administre.common");

  const [itemModal, setItemModal] = useState<{ open: boolean; item: IOrderItem | null }>({ open: false, item: null });
  const [editingOrder, setEditingOrder] = useState(false);
  const [busy, setBusy] = useState(false);

  const pending = order.state === "PENDING";
  const managed = Boolean(order.stock_managed);
  const warehouseNames = useMemo(
    () => new Map(warehouses.map((warehouse) => [warehouse.id ?? -1, warehouse.name ?? `#${warehouse.id}`])),
    [warehouses],
  );
  const reservationsByLine = useMemo(() => {
    const map = new Map<number, IOrderReservation[]>();
    reservations.forEach((reservation) => {
      if (reservation.quantity === 0) return;
      map.set(reservation.line_id ?? -1, [...(map.get(reservation.line_id ?? -1) ?? []), reservation]);
    });
    return map;
  }, [reservations]);
  const expiresAt = reservations.find((reservation) => reservation.status === "ACTIVE")?.expires_at;

  const units = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  const showError = (message?: string) => notify.error(tCommon("errorTitle"), message || tCommon("unexpectedError"));
  const lineName = (item: IOrderItem) => item.product_name ?? `#${item.product_id}`;

  const handleDeleteItem = async (item: IOrderItem) => {
    if (item.id == null || order.id == null) return;
    const ok = await confirm({
      title: tCommon("deleteConfirmTitle"),
      description: tCommon("deleteConfirmText", { name: lineName(item) }),
      confirmLabel: tCommon("deleteConfirmButton"),
      tone: "danger",
    });
    if (!ok) return;
    const response = await deleteOrderItemServerAction(item.id, order.id);
    if (response.success) {
      notify.success(tCommon("deletedSuccess"), lineName(item));
      router.refresh();
    } else {
      showError(response.error);
    }
  };

  const changeState = async (next: OrderState) => {
    if (order.id == null) return;
    let reason: string | undefined;
    if (next === "CANCELLED") {
      const value = await prompt({
        title: t("transitions.CANCELLED"),
        description: managed ? (order.state === "PENDING" ? t("cancelReleases") : t("cancelRestocks")) : undefined,
        confirmLabel: t("transitions.CANCELLED"),
        tone: "danger",
        input: { label: t("cancelReason"), multiline: true, required: false },
      });
      if (value === null) return;
      reason = value.trim() || undefined;
    } else {
      const ok = await confirm({
        title: t(`transitions.${next}`),
        description: managed && next === "PAID" ? t("payCommits") : t("confirmTransition", { state: tStates(next) }),
        confirmLabel: t(`transitions.${next}`),
      });
      if (!ok) return;
    }
    setBusy(true);
    const response = await changeOrderStatusServerAction(order.id, next, reason);
    setBusy(false);
    if (response.success) {
      notify.success(t("stateChanged", { state: tStates(next) }));
      router.refresh();
    } else {
      showError(response.error);
    }
  };

  const columns: GridColumn<IOrderItem>[] = [
    {
      id: "product",
      accessorFn: (row) => lineName(row),
      header: tItems("fields.productId"),
      meta: { label: tItems("fields.productId"), hideable: false, exportValue: (row) => lineName(row) },
      cell: ({ row }) => (
        <div className='min-w-0'>
          <span className='font-semibold text-foreground'>{lineName(row.original)}</span>
          {row.original.sku_code ? (
            <p className='font-mono text-xs text-muted-foreground'>{row.original.sku_code}</p>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "unit_price",
      header: tItems("fields.unitPrice"),
      meta: { label: tItems("fields.unitPrice"), align: "right", exportValue: (row) => row.unit_price },
      cell: ({ row }) => <span className='tabular-nums'>{formatMoney(row.original.unit_price)}</span>,
    },
    {
      accessorKey: "quantity",
      header: tItems("fields.quantity"),
      meta: { label: tItems("fields.quantity"), align: "right", exportValue: (row) => row.quantity },
      cell: ({ row }) => <span className='tabular-nums'>{row.original.quantity ?? "—"}</span>,
    },
    {
      accessorKey: "discount",
      header: tItems("fields.discount"),
      meta: { label: tItems("fields.discount"), align: "right", exportValue: (row) => row.discount },
      cell: ({ row }) => <span className='tabular-nums'>{formatMoney(row.original.discount)}</span>,
    },
    {
      accessorKey: "total",
      header: tItems("fields.total"),
      meta: { label: tItems("fields.total"), align: "right", exportValue: (row) => row.total },
      cell: ({ row }) => <span className='font-medium tabular-nums'>{formatMoney(row.original.total)}</span>,
    },
    ...(managed
      ? [
          {
            id: "stock",
            header: tItems("fields.stock"),
            enableSorting: false,
            meta: { label: tItems("fields.stock") },
            cell: ({ row }: { row: { original: IOrderItem } }) => {
              const list = reservationsByLine.get(row.original.id ?? -1) ?? [];
              if (list.length === 0) return <span className='text-muted-foreground'>—</span>;
              return (
                <div className='flex flex-wrap gap-1'>
                  {list.map((reservation) => (
                    <Badge key={reservation.id} variant={RESERVATION_VARIANT[reservation.status ?? ""] ?? "outline"}>
                      {t(`reservationStatus.${(reservation.status ?? "ACTIVE") as "ACTIVE"}`)} {reservation.quantity} ·{" "}
                      {warehouseNames.get(reservation.warehouse_id ?? -1) ?? `#${reservation.warehouse_id}`}
                    </Badge>
                  ))}
                </div>
              );
            },
          } as GridColumn<IOrderItem>,
        ]
      : []),
  ];

  const itemRowActions = (item: IOrderItem): RowAction[] =>
    pending
      ? [
          { label: tCommon("edit"), icon: HiOutlinePencilSquare, onSelect: () => setItemModal({ open: true, item }) },
          {
            label: tCommon("delete"),
            icon: HiOutlineTrash,
            tone: "danger",
            separated: true,
            onSelect: () => handleDeleteItem(item),
          },
        ]
      : [];

  const summary = [
    { label: t("fields.state"), value: <OrderStatusBadge state={order.state} /> },
    { label: t("fields.complementaryOrder"), value: order.complementary_order || "—" },
    { label: t("fields.units"), value: units },
    { label: t("fields.total"), value: formatMoney(order.total) },
  ];

  const nextStates = (order.next_states ?? []).filter(isOrderState).sort(
    (a, b) => ORDER_STATES.indexOf(a) - ORDER_STATES.indexOf(b),
  );

  return (
    <section className='flex w-full flex-col gap-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='space-y-2'>
          <Link
            href='/ventas/orders'
            className='inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground'>
            <HiOutlineArrowLeft className='h-4 w-4' aria-hidden='true' />
            {t("backToList")}
          </Link>
          <h2 className='text-xl font-semibold tracking-tight text-foreground'>{t("orderLabel", { id: order.id ?? "—" })}</h2>
        </div>
        <div className='flex flex-wrap gap-2'>
          {nextStates.map((next) => (
            <Buttons
              key={next}
              variant={next === "CANCELLED" ? "outline" : "default"}
              disabled={busy}
              onClick={() => changeState(next)}
              className='rounded-full'>
              {t(`transitions.${next}`)}
            </Buttons>
          ))}
          <Buttons variant='outline' onClick={() => setEditingOrder(true)} className='rounded-full'>
            <HiOutlinePencilSquare className='h-4 w-4' aria-hidden='true' />
            {t("editTitle")}
          </Buttons>
          {pending ? (
            <Buttons onClick={() => setItemModal({ open: true, item: null })} className='rounded-full'>
              <HiOutlinePlusCircle className='h-4 w-4' aria-hidden='true' />
              {tItems("create")}
            </Buttons>
          ) : null}
        </div>
      </div>

      <div className='flex flex-col gap-5 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6'>
        <StatCards items={summary} />

        <div className='flex gap-2 rounded-xl border border-border bg-muted/30 p-3 text-sm' role='status'>
          <HiOutlineInformationCircle className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground' aria-hidden='true' />
          <p>
            {!managed
              ? t("legacyStock")
              : order.state === "CANCELLED"
                ? order.cancel_reason
                  ? t("cancelledWithReason", { reason: order.cancel_reason })
                  : t("cancelledStock")
                : pending
                  ? expiresAt
                    ? t("pendingStockUntil", { date: new Date(expiresAt).toLocaleString() })
                    : t("pendingStock")
                  : t("committedStock")}
          </p>
        </div>

        <div className='space-y-3'>
          <div className='flex flex-wrap items-baseline justify-between gap-2'>
            <h3 className='text-base font-semibold text-foreground'>{tItems("title")}</h3>
            {!pending ? <p className='text-xs text-muted-foreground'>{tItems("locked")}</p> : null}
          </div>
          <DataGrid<IOrderItem>
            mode='client'
            embedded
            id='order-items'
            caption={tItems("title")}
            data={items}
            columns={columns}
            getRowId={(item) => String(item.id)}
            searchText={(item) => `${lineName(item)} ${item.sku_code ?? ""}`}
            rowActions={pending ? itemRowActions : undefined}
            emptyState={{ title: tItems("emptyTitle"), description: tItems("emptyDescription") }}
          />
        </div>
      </div>

      <Modal
        size='lg'
        title={itemModal.item ? tItems("editTitle") : tItems("createTitle")}
        open={itemModal.open}
        onOpenChange={(open) => {
          if (!open) setItemModal({ open: false, item: null });
        }}
        hideDefaultFooter={true}>
        {itemModal.open && order.id != null ? (
          <OrderItemForm
            orderId={order.id}
            item={itemModal.item}
            skus={skus}
            handleClose={() => setItemModal({ open: false, item: null })}
          />
        ) : null}
      </Modal>

      <Modal size='lg' title={t("editTitle")} open={editingOrder} onOpenChange={setEditingOrder} hideDefaultFooter={true}>
        {editingOrder ? <UpdateOrder order={order} handleClose={() => setEditingOrder(false)} /> : null}
      </Modal>
    </section>
  );
};
