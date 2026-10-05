/** @format */

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { confirm, notify } from "@/components/notifications";
import { Modal } from "@repo/ui/modals/scenes/dialog/modal";
import { Buttons } from "@repo/ui/buttons/scenes";
import {
  HiOutlineArrowLeft,
  HiOutlinePlusCircle,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineCalculator,
} from "react-icons/hi2";
import { DataGrid, type GridColumn, type RowAction } from "@/components/data-grid";
import { StatCards } from "@/components/stat-cards";
import { Link } from "@/shared/i18n/routing";
import { OrderItemForm, UpdateOrder } from "./form";
import { OrderStatusBadge } from "./order-status-badge";
import { formatMoney } from "../constants";
import type { IOrder, IOrderItem, IOrderProduct } from "../models/order.interface";
import {
  deleteOrderItemServerAction,
  updateOrderServerAction,
} from "@/app/[locale]/ventas/orders/actions";

interface IOrderDetailProps {
  order: IOrder;
  items: IOrderItem[];
  products: IOrderProduct[];
}

export const OrderDetail = ({ order, items, products }: IOrderDetailProps) => {
  const router = useRouter();
  const t = useTranslations("Administre.order");
  const tItems = useTranslations("Administre.order.items");
  const tCommon = useTranslations("Administre.common");

  const [itemModal, setItemModal] = useState<{ open: boolean; item: IOrderItem | null }>({
    open: false,
    item: null,
  });
  const [editingOrder, setEditingOrder] = useState(false);

  const productNames = useMemo(
    () => new Map(products.map((product) => [product.id ?? -1, product.name ?? `#${product.id}`])),
    [products],
  );

  const totals = useMemo(
    () =>
      items.reduce<{ units: number; subtotal: number; discount: number; total: number }>(
        (acc, item) => ({
          units: acc.units + (item.quantity ?? 0),
          subtotal: acc.subtotal + (item.subtotal ?? 0),
          discount: acc.discount + (item.discount ?? 0),
          total: acc.total + (item.total ?? 0),
        }),
        { units: 0, subtotal: 0, discount: 0, total: 0 },
      ),
    [items],
  );

  const outOfSync = Math.abs((order.total ?? 0) - totals.total) > 0.009;

  const showError = (message?: string) =>
    notify.error(tCommon("errorTitle"), message || tCommon("unexpectedError"));

  const handleDeleteItem = async (item: IOrderItem) => {
    if (item.id == null) return;
    const id = item.id;
    const name = productNames.get(item.productId ?? -1) ?? `#${id}`;
    const ok = await confirm({
      title: tCommon("deleteConfirmTitle"),
      description: tCommon("deleteConfirmText", { name }),
      confirmLabel: tCommon("deleteConfirmButton"),
      tone: "danger",
    });
    if (!ok) return;
    const response = await deleteOrderItemServerAction(id);
    if (response.success) {
      notify.success(tCommon("deletedSuccess"), name);
      router.refresh();
    } else {
      showError(response.error);
    }
  };

  const handleSyncTotal = async () => {
    if (order.id == null) return;
    const response = await updateOrderServerAction({
      id: order.id,
      state: order.state ?? "PENDING",
      complementaryOrder: order.complementaryOrder,
      total: totals.total,
    });
    if (response.success) {
      notify.success(t("totalSynced"));
      router.refresh();
    } else {
      showError(response.error);
    }
  };

  const columns: GridColumn<IOrderItem>[] = [
    {
      accessorKey: "productId",
      header: tItems("fields.productId"),
      meta: { label: tItems("fields.productId"), hideable: false },
      cell: ({ row }) => (
        <span className='font-semibold text-foreground'>
          {productNames.get(row.original.productId ?? -1) ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "quantity",
      header: tItems("fields.quantity"),
      meta: { label: tItems("fields.quantity"), align: "right", exportValue: (row) => row.quantity },
      cell: ({ row }) => <span className='tabular-nums'>{row.original.quantity ?? "—"}</span>,
    },
    {
      accessorKey: "subtotal",
      header: tItems("fields.subtotal"),
      meta: { label: tItems("fields.subtotal"), align: "right", exportValue: (row) => row.subtotal },
      cell: ({ row }) => <span className='tabular-nums'>{formatMoney(row.original.subtotal)}</span>,
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
  ];

  const itemRowActions = (item: IOrderItem): RowAction[] => [
    {
      label: tCommon("edit"),
      icon: HiOutlinePencilSquare,
      onSelect: () => setItemModal({ open: true, item }),
    },
    {
      label: tCommon("delete"),
      icon: HiOutlineTrash,
      tone: "danger",
      separated: true,
      onSelect: () => handleDeleteItem(item),
    },
  ];

  const summary = [
    { label: t("fields.state"), value: <OrderStatusBadge state={order.state} /> },
    { label: t("fields.complementaryOrder"), value: order.complementaryOrder || "—" },
    { label: t("fields.units"), value: totals.units },
    { label: t("fields.total"), value: formatMoney(order.total) },
  ];

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
          <h2 className='text-xl font-semibold tracking-tight text-foreground'>
            {t("orderLabel", { id: order.id ?? "—" })}
          </h2>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Buttons variant='outline' onClick={() => setEditingOrder(true)} className='rounded-full'>
            <HiOutlinePencilSquare className='h-4 w-4' aria-hidden='true' />
            {t("editTitle")}
          </Buttons>
          <Buttons onClick={() => setItemModal({ open: true, item: null })} className='rounded-full'>
            <HiOutlinePlusCircle className='h-4 w-4' aria-hidden='true' />
            {tItems("create")}
          </Buttons>
        </div>
      </div>

      <div className='flex flex-col gap-5 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6'>
        <StatCards items={summary} />

        {outOfSync && items.length > 0 ? (
          <div
            role='status'
            className='flex flex-col gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm text-foreground sm:flex-row sm:items-center sm:justify-between'>
            <p>
              {t("totalMismatch", {
                orderTotal: formatMoney(order.total),
                itemsTotal: formatMoney(totals.total),
              })}
            </p>
            <Buttons size='sm' variant='outline' onClick={handleSyncTotal} className='rounded-full'>
              <HiOutlineCalculator className='h-4 w-4' aria-hidden='true' />
              {t("syncTotal")}
            </Buttons>
          </div>
        ) : null}

        <div className='space-y-3'>
          <h3 className='text-base font-semibold text-foreground'>{tItems("title")}</h3>
          <DataGrid<IOrderItem>
            mode='client'
            embedded
            id='order-items'
            caption={tItems("title")}
            data={items}
            columns={columns}
            getRowId={(item) => String(item.id)}
            searchText={(item) => productNames.get(item.productId ?? -1) ?? ""}
            rowActions={itemRowActions}
            emptyState={{
              title: tItems("emptyTitle"),
              description: tItems("emptyDescription"),
            }}
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
            products={products}
            handleClose={() => setItemModal({ open: false, item: null })}
          />
        ) : null}
      </Modal>

      <Modal
        size='lg'
        title={t("editTitle")}
        open={editingOrder}
        onOpenChange={setEditingOrder}
        hideDefaultFooter={true}>
        {editingOrder ? <UpdateOrder order={order} handleClose={() => setEditingOrder(false)} /> : null}
      </Modal>
    </section>
  );
};
