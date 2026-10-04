/** @format */

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import Swal from "sweetalert2";
import classNames from "classnames";
import { Modal } from "@repo/ui/modals/scenes/dialog/modal";
import { Buttons } from "@repo/ui/buttons/scenes";
import {
  HiOutlineShoppingBag,
  HiOutlinePlusCircle,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineBanknotes,
  HiOutlineClock,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import { DataTable } from "@/components/data-table";
import { Link } from "@/shared/i18n/routing";
import { RegisterOrder, UpdateOrder } from "./form";
import { OrderStatusBadge } from "./order-status-badge";
import { ORDER_STATES, formatMoney } from "../constants";
import type { IOrder, IOrderItem } from "../models/order.interface";
import { deleteOrderServerAction } from "@/app/[locale]/ventas/orders/actions";

interface IOrderManagerProps {
  initialData: IOrder[];
  items: IOrderItem[];
}

type StateFilter = "ALL" | (typeof ORDER_STATES)[number];

export const OrderManager = ({ initialData, items }: IOrderManagerProps) => {
  const router = useRouter();
  const t = useTranslations("Administre.order");
  const tCommon = useTranslations("Administre.common");

  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState<IOrder | null>(null);
  const [stateFilter, setStateFilter] = useState<StateFilter>("ALL");

  const itemsByOrder = useMemo(() => {
    const counts = new Map<number, number>();
    items.forEach((item) => {
      if (item.orderId == null) return;
      counts.set(item.orderId, (counts.get(item.orderId) ?? 0) + (item.quantity ?? 0));
    });
    return counts;
  }, [items]);

  const metrics = useMemo(() => {
    const valid = initialData.filter((order) => order.state !== "CANCELLED");
    return {
      total: initialData.length,
      revenue: valid.reduce((acc, order) => acc + (order.total ?? 0), 0),
      pending: initialData.filter((order) => order.state === "PENDING").length,
      delivered: initialData.filter((order) => order.state === "DELIVERED").length,
    };
  }, [initialData]);

  const data = useMemo(
    () =>
      stateFilter === "ALL"
        ? initialData
        : initialData.filter((order) => order.state === stateFilter),
    [initialData, stateFilter],
  );

  const handleDelete = (order: IOrder) => {
    if (order.id == null) return;
    const id = order.id;

    Swal.fire({
      title: tCommon("deleteConfirmTitle"),
      text: tCommon("deleteConfirmText", { name: t("orderLabel", { id }) }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: tCommon("deleteConfirmButton"),
      cancelButtonText: tCommon("cancel"),
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      const response = await deleteOrderServerAction(id);
      if (response.success) {
        Swal.fire({ title: tCommon("deletedSuccess"), icon: "success", timer: 2000, showConfirmButton: false });
        router.refresh();
      } else {
        Swal.fire({ title: tCommon("errorTitle"), text: response.error || tCommon("unexpectedError"), icon: "error" });
      }
    });
  };

  const columns: ColumnDef<IOrder>[] = [
    {
      accessorKey: "id",
      header: t("fields.id"),
      cell: ({ row }) => (
        <span className='font-semibold text-foreground'>{t("orderLabel", { id: row.original.id ?? "—" })}</span>
      ),
    },
    {
      accessorKey: "complementaryOrder",
      header: t("fields.complementaryOrder"),
      cell: ({ row }) => row.original.complementaryOrder || "—",
    },
    {
      id: "units",
      header: t("fields.units"),
      cell: ({ row }) => itemsByOrder.get(row.original.id ?? -1) ?? 0,
    },
    {
      accessorKey: "state",
      header: t("fields.state"),
      cell: ({ row }) => <OrderStatusBadge state={row.original.state} />,
    },
    {
      accessorKey: "total",
      header: t("fields.total"),
      cell: ({ row }) => formatMoney(row.original.total),
    },
    {
      id: "actions",
      header: tCommon("actions"),
      enableSorting: false,
      cell: ({ row }) => {
        const label = t("orderLabel", { id: row.original.id ?? "—" });
        return (
          <div className='flex gap-2'>
            <Link
              href={`/administre/orders/${row.original.id}`}
              aria-label={t("viewAria", { name: label })}
              className='inline-flex h-8 items-center gap-1 rounded-lg border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted'>
              <HiOutlineEye className='h-4 w-4' aria-hidden='true' />
              {t("view")}
            </Link>
            <Buttons
              size='sm'
              variant='outline'
              aria-label={tCommon("editAria", { name: label })}
              onClick={() => setEditing(row.original)}>
              <HiOutlinePencilSquare className='h-4 w-4' aria-hidden='true' />
              {tCommon("edit")}
            </Buttons>
            <Buttons
              size='sm'
              variant='ghost'
              aria-label={tCommon("deleteAria", { name: label })}
              onClick={() => handleDelete(row.original)}>
              <HiOutlineTrash className='h-4 w-4' aria-hidden='true' />
              {tCommon("delete")}
            </Buttons>
          </div>
        );
      },
    },
  ];

  const summaryCards = [
    { icon: HiOutlineShoppingBag, label: t("total"), value: metrics.total },
    { icon: HiOutlineBanknotes, label: t("revenue"), value: formatMoney(metrics.revenue) },
    { icon: HiOutlineClock, label: t("pendingCount"), value: metrics.pending },
    { icon: HiOutlineCheckCircle, label: t("deliveredCount"), value: metrics.delivered },
  ];

  const filters: StateFilter[] = ["ALL", ...ORDER_STATES];

  return (
    <section className='flex w-full flex-col gap-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-4'>
          <div className='rounded-2xl bg-primary/10 p-3'>
            <HiOutlineShoppingBag className='h-7 w-7 text-primary' aria-hidden='true' />
          </div>
          <div>
            <h2 className='text-xl font-semibold tracking-tight text-foreground'>{t("title")}</h2>
            <p className='mt-1.5 text-base text-muted-foreground'>{t("description")}</p>
          </div>
        </div>
        <Buttons
          className='inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-sm'
          onClick={() => setOpenCreate(true)}>
          <HiOutlinePlusCircle className='h-4 w-4' aria-hidden='true' />
          {t("create")}
        </Buttons>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className='rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md'>
            <div className='flex items-center justify-between text-sm font-semibold text-muted-foreground'>
              <span>{card.label}</span>
              <card.icon className='h-5 w-5 text-primary' aria-hidden='true' />
            </div>
            <p className='mt-2 text-2xl font-semibold text-foreground'>{card.value}</p>
          </div>
        ))}
      </div>

      <div
        role='group'
        aria-label={t("filterLabel")}
        className='flex flex-wrap gap-2'>
        {filters.map((filter) => (
          <button
            key={filter}
            type='button'
            aria-pressed={stateFilter === filter}
            onClick={() => setStateFilter(filter)}
            className={classNames(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              stateFilter === filter
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}>
            {filter === "ALL" ? t("allStates") : t(`states.${filter}`)}
          </button>
        ))}
      </div>

      <DataTable
        data={data}
        columns={columns}
        className='py-2'
        emptyTitle={t("emptyTitle")}
        emptyDescription={t("emptyDescription")}
      />

      <Modal size='lg' title={t("createTitle")} open={openCreate} onOpenChange={setOpenCreate} hideDefaultFooter={true}>
        <RegisterOrder handleClose={() => setOpenCreate(false)} />
      </Modal>

      <Modal
        size='lg'
        title={t("editTitle")}
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        hideDefaultFooter={true}>
        <UpdateOrder order={editing} handleClose={() => setEditing(null)} />
      </Modal>
    </section>
  );
};
