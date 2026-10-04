/** @format */

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import Swal from "sweetalert2";
import { Modal } from "@repo/ui/modals/scenes/dialog/modal";
import { Buttons } from "@repo/ui/buttons/scenes";
import {
  HiOutlineArrowLeft,
  HiOutlinePlusCircle,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineCalculator,
} from "react-icons/hi2";
import { DataTable } from "@/components/data-table";
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
    Swal.fire({ title: tCommon("errorTitle"), text: message || tCommon("unexpectedError"), icon: "error" });

  const handleDeleteItem = (item: IOrderItem) => {
    if (item.id == null) return;
    const id = item.id;

    Swal.fire({
      title: tCommon("deleteConfirmTitle"),
      text: tCommon("deleteConfirmText", { name: productNames.get(item.productId ?? -1) ?? `#${id}` }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: tCommon("deleteConfirmButton"),
      cancelButtonText: tCommon("cancel"),
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      const response = await deleteOrderItemServerAction(id);
      if (response.success) {
        router.refresh();
      } else {
        showError(response.error);
      }
    });
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
      Swal.fire({ title: t("totalSynced"), icon: "success", timer: 2000, showConfirmButton: false });
      router.refresh();
    } else {
      showError(response.error);
    }
  };

  const columns: ColumnDef<IOrderItem>[] = [
    {
      accessorKey: "productId",
      header: tItems("fields.productId"),
      cell: ({ row }) => (
        <span className='font-semibold text-foreground'>
          {productNames.get(row.original.productId ?? -1) ?? "—"}
        </span>
      ),
    },
    { accessorKey: "quantity", header: tItems("fields.quantity") },
    {
      accessorKey: "subtotal",
      header: tItems("fields.subtotal"),
      cell: ({ row }) => formatMoney(row.original.subtotal),
    },
    {
      accessorKey: "discount",
      header: tItems("fields.discount"),
      cell: ({ row }) => formatMoney(row.original.discount),
    },
    {
      accessorKey: "total",
      header: tItems("fields.total"),
      cell: ({ row }) => formatMoney(row.original.total),
    },
    {
      id: "actions",
      header: tCommon("actions"),
      enableSorting: false,
      cell: ({ row }) => {
        const name = productNames.get(row.original.productId ?? -1) ?? `#${row.original.id}`;
        return (
          <div className='flex gap-2'>
            <Buttons
              size='sm'
              variant='outline'
              aria-label={tCommon("editAria", { name })}
              onClick={() => setItemModal({ open: true, item: row.original })}>
              <HiOutlinePencilSquare className='h-4 w-4' aria-hidden='true' />
              {tCommon("edit")}
            </Buttons>
            <Buttons
              size='sm'
              variant='ghost'
              aria-label={tCommon("deleteAria", { name })}
              onClick={() => handleDeleteItem(row.original)}>
              <HiOutlineTrash className='h-4 w-4' aria-hidden='true' />
              {tCommon("delete")}
            </Buttons>
          </div>
        );
      },
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
            href='/administre/orders'
            className='inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground'>
            <HiOutlineArrowLeft className='h-4 w-4' aria-hidden='true' />
            {t("backToList")}
          </Link>
          <h2 className='text-xl font-semibold tracking-tight text-foreground'>
            {t("orderLabel", { id: order.id ?? "—" })}
          </h2>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Buttons variant='outline' onClick={() => setEditingOrder(true)}>
            <HiOutlinePencilSquare className='h-4 w-4' aria-hidden='true' />
            {t("editTitle")}
          </Buttons>
          <Buttons onClick={() => setItemModal({ open: true, item: null })}>
            <HiOutlinePlusCircle className='h-4 w-4' aria-hidden='true' />
            {tItems("create")}
          </Buttons>
        </div>
      </div>

      <dl className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {summary.map((entry) => (
          <div key={entry.label} className='rounded-2xl border border-border bg-card p-5 shadow-sm'>
            <dt className='text-sm font-semibold text-muted-foreground'>{entry.label}</dt>
            <dd className='mt-2 text-xl font-semibold text-foreground'>{entry.value}</dd>
          </div>
        ))}
      </dl>

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
          <Buttons size='sm' variant='outline' onClick={handleSyncTotal}>
            <HiOutlineCalculator className='h-4 w-4' aria-hidden='true' />
            {t("syncTotal")}
          </Buttons>
        </div>
      ) : null}

      <div className='space-y-3'>
        <h3 className='text-base font-semibold text-foreground'>{tItems("title")}</h3>
        <DataTable
          data={items}
          columns={columns}
          emptyTitle={tItems("emptyTitle")}
          emptyDescription={tItems("emptyDescription")}
        />
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
