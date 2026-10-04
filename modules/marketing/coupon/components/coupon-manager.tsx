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
import { Badge } from "@repo/ui/badges/scenes/badge";
import {
  HiOutlineTicket,
  HiOutlinePlusCircle,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineChartBar,
} from "react-icons/hi2";
import { DataTable } from "@/components/data-table";
import { CouponForm } from "./form";
import { CouponSimulator } from "./coupon-simulator";
import type { CouponStatus, ICoupon, INamedItem } from "../models/coupon.interface";
import { couponStatus, formatDate, formatMoney } from "../utils";
import { deleteCouponServerAction } from "@/app/[locale]/marketing/coupons/actions";

interface ICouponManagerProps {
  initialData: ICoupon[];
  categories: INamedItem[];
  products: INamedItem[];
}

const STATUS_VARIANT: Record<CouponStatus, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  scheduled: "secondary",
  expired: "outline",
  exhausted: "outline",
  inactive: "destructive",
};

const STATUSES: ("all" | CouponStatus)[] = ["all", "active", "scheduled", "expired", "exhausted", "inactive"];

type ModalState = { open: boolean; coupon: ICoupon | null };

export const CouponManager = ({ initialData, categories, products }: ICouponManagerProps) => {
  const router = useRouter();
  const t = useTranslations("Administre.coupon");
  const tCommon = useTranslations("Administre.common");
  const [modal, setModal] = useState<ModalState>({ open: false, coupon: null });
  const [statusFilter, setStatusFilter] = useState<"all" | CouponStatus>("all");

  const withStatus = useMemo(
    () => initialData.map((coupon) => ({ coupon, status: couponStatus(coupon) })),
    [initialData],
  );

  const metrics = useMemo(
    () => ({
      total: initialData.length,
      active: withStatus.filter((item) => item.status === "active").length,
      scheduled: withStatus.filter((item) => item.status === "scheduled").length,
      uses: initialData.reduce((acc, coupon) => acc + (coupon.usageCount ?? 0), 0),
    }),
    [initialData, withStatus],
  );

  const data = useMemo(
    () =>
      statusFilter === "all"
        ? initialData
        : withStatus.filter((item) => item.status === statusFilter).map((item) => item.coupon),
    [initialData, withStatus, statusFilter],
  );

  const formatDiscount = (coupon: ICoupon) => {
    if (coupon.discountType === "FREE_SHIPPING") return t("types.FREE_SHIPPING");
    if (coupon.discountType === "PERCENTAGE") return `${coupon.discountValue ?? 0}%`;
    return formatMoney(coupon.discountValue);
  };

  const handleDelete = (coupon: ICoupon) => {
    if (coupon.id == null) return;
    const id = coupon.id;
    Swal.fire({
      title: tCommon("deleteConfirmTitle"),
      text: tCommon("deleteConfirmText", { name: coupon.code ?? `#${id}` }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: tCommon("deleteConfirmButton"),
      cancelButtonText: tCommon("cancel"),
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      const response = await deleteCouponServerAction(id);
      if (response.success) {
        Swal.fire({ title: tCommon("deletedSuccess"), icon: "success", timer: 2000, showConfirmButton: false });
        router.refresh();
      } else {
        Swal.fire({ title: tCommon("errorTitle"), text: response.error || tCommon("unexpectedError"), icon: "error" });
      }
    });
  };

  const columns: ColumnDef<ICoupon>[] = [
    {
      accessorKey: "code",
      header: t("fields.code"),
      cell: ({ row }) => (
        <div className='flex flex-col'>
          <span className='font-mono font-semibold text-foreground'>{row.original.code}</span>
          <span className='text-xs text-muted-foreground'>{row.original.name}</span>
        </div>
      ),
    },
    { id: "discount", header: t("fields.discount"), cell: ({ row }) => formatDiscount(row.original) },
    {
      id: "validity",
      header: t("fields.validity"),
      cell: ({ row }) => `${formatDate(row.original.validFrom)} – ${formatDate(row.original.validUntil)}`,
    },
    {
      id: "usage",
      header: t("fields.usage"),
      cell: ({ row }) =>
        row.original.usageLimit != null
          ? `${row.original.usageCount ?? 0} / ${row.original.usageLimit}`
          : `${row.original.usageCount ?? 0} / ∞`,
    },
    {
      id: "status",
      header: tCommon("status"),
      cell: ({ row }) => {
        const status = couponStatus(row.original);
        return <Badge variant={STATUS_VARIANT[status]}>{t(`status.${status}`)}</Badge>;
      },
    },
    {
      accessorKey: "isPublic",
      header: t("fields.isPublic"),
      cell: ({ row }) => (row.original.isPublic ? tCommon("yes") : tCommon("no")),
    },
    {
      id: "actions",
      header: tCommon("actions"),
      enableSorting: false,
      cell: ({ row }) => (
        <div className='flex gap-2'>
          <Buttons
            size='sm'
            variant='outline'
            aria-label={tCommon("editAria", { name: row.original.code ?? "" })}
            onClick={() => setModal({ open: true, coupon: row.original })}>
            <HiOutlinePencilSquare className='h-4 w-4' aria-hidden='true' />
            {tCommon("edit")}
          </Buttons>
          <Buttons
            size='sm'
            variant='ghost'
            aria-label={tCommon("deleteAria", { name: row.original.code ?? "" })}
            onClick={() => handleDelete(row.original)}>
            <HiOutlineTrash className='h-4 w-4' aria-hidden='true' />
            {tCommon("delete")}
          </Buttons>
        </div>
      ),
    },
  ];

  const summaryCards = [
    { icon: HiOutlineTicket, label: t("total"), value: metrics.total },
    { icon: HiOutlineCheckCircle, label: t("activeNow"), value: metrics.active },
    { icon: HiOutlineClock, label: t("scheduledCount"), value: metrics.scheduled },
    { icon: HiOutlineChartBar, label: t("usesCount"), value: metrics.uses },
  ];

  return (
    <section className='flex w-full flex-col gap-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-4'>
          <div className='rounded-2xl bg-primary/10 p-3'>
            <HiOutlineTicket className='h-7 w-7 text-primary' aria-hidden='true' />
          </div>
          <div>
            <h2 className='text-xl font-semibold tracking-tight text-foreground'>{t("title")}</h2>
            <p className='mt-1.5 text-base text-muted-foreground'>{t("description")}</p>
          </div>
        </div>
        <Buttons
          className='inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-sm'
          onClick={() => setModal({ open: true, coupon: null })}>
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

      <CouponSimulator />

      <div role='group' aria-label={t("filterLabel")} className='flex flex-wrap gap-2'>
        {STATUSES.map((status) => (
          <button
            key={status}
            type='button'
            aria-pressed={statusFilter === status}
            onClick={() => setStatusFilter(status)}
            className={classNames(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              statusFilter === status
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}>
            {status === "all" ? t("allStatuses") : t(`status.${status}`)}
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

      <Modal
        size='xl'
        title={modal.coupon ? t("editTitle") : t("createTitle")}
        open={modal.open}
        onOpenChange={(open) => {
          if (!open) setModal({ open: false, coupon: null });
        }}
        hideDefaultFooter={true}>
        {modal.open ? (
          <CouponForm
            coupon={modal.coupon}
            categories={categories}
            products={products}
            handleClose={() => setModal({ open: false, coupon: null })}
          />
        ) : null}
      </Modal>
    </section>
  );
};
