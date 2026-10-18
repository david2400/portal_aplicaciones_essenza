/** @format */

"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  HiOutlineBuildingOffice2,
  HiOutlineCheckCircle,
  HiOutlineCreditCard,
  HiOutlineEye,
  HiOutlineIdentification,
  HiOutlineNoSymbol,
  HiOutlinePencilSquare,
  HiOutlinePlusCircle,
} from "react-icons/hi2";
import { CrudManager } from "@/components/crud-manager";
import type { GridColumn, GridFilter } from "@/components/data-grid";
import { formatNumber } from "@/lib/format";
import { Link } from "@/shared/i18n/routing";
import type { PageResult } from "@/shared/models/pagination";
import { SUPPLIER_STATUSES, SUPPLIERS_HREF, type ISupplier, type ISupplierStats } from "../models/supplier.interface";
import { useSupplierStatus } from "../hooks/useSupplierStatus";
import { SupplierStatusBadge } from "./supplier-status-badge";
import {
  bulkDeleteSuppliersServerAction,
  deleteSupplierServerAction,
  exportSuppliersServerAction,
} from "@/app/[locale]/inventory/suppliers/actions";

interface ISupplierManagerProps {
  page: PageResult<ISupplier>;
  stats: ISupplierStats | null;
}

/** Proveedores: búsqueda y filtros en el servidor, estado, condiciones y productos; alta y edición en página propia. */
export const SupplierManager = ({ page, stats }: ISupplierManagerProps) => {
  const router = useRouter();
  const t = useTranslations("Administre.supplier");
  const tOpt = useTranslations("Administre.supplier.options");
  const tStatuses = useTranslations("Administre.supplier.statuses");
  const tStatus = useTranslations("Administre.supplier.statusActions");
  const tCrud = useTranslations("Crud");
  const { change } = useSupplierStatus();

  const term = (row: ISupplier) => ((row.payment_term_days ?? 0) === 0 ? tOpt("cash") : tOpt("days", { days: row.payment_term_days ?? 0 }));

  const columns = useMemo<GridColumn<ISupplier>[]>(
    () => [
      {
        id: "name",
        header: t("fields.supplier"),
        meta: { label: t("fields.supplier"), hideable: false, exportValue: (row) => row.name },
        cell: ({ row }) => (
          <div className='min-w-0'>
            <Link href={`${SUPPLIERS_HREF}/${row.original.id}`} className='font-semibold text-foreground underline-offset-4 hover:text-primary hover:underline'>
              {row.original.display_name ?? row.original.name ?? "—"}
            </Link>
            <p className='truncate text-xs text-muted-foreground'>
              {[row.original.trade_name ? row.original.name : null, row.original.code].filter(Boolean).join(" · ")}
            </p>
          </div>
        ),
      },
      {
        id: "document",
        header: t("fields.docNumber"),
        enableSorting: false,
        meta: { label: t("fields.docNumber"), exportValue: (row) => (row.document ? `${row.doc_type} ${row.document}` : "") },
        cell: ({ row }) =>
          row.original.document ? (
            <span className='whitespace-nowrap font-mono text-xs tabular-nums'>{`${row.original.doc_type} ${row.original.document}`}</span>
          ) : (
            <span className='text-xs text-amber-700 dark:text-amber-400'>{t("noDocument")}</span>
          ),
      },
      {
        id: "city",
        header: t("fields.city"),
        meta: { label: t("fields.city"), exportValue: (row) => row.city },
        cell: ({ row }) => row.original.city ?? "—",
      },
      {
        id: "contact",
        header: t("fields.primaryContact"),
        enableSorting: false,
        meta: {
          label: t("fields.primaryContact"),
          exportValue: (row) => [row.primary_contact_name, row.primary_contact_phone ?? row.phone, row.primary_contact_email ?? row.email].filter(Boolean).join(" · "),
        },
        cell: ({ row }) => (
          <div className='min-w-0 text-sm'>
            <p className='truncate'>{row.original.primary_contact_name ?? row.original.email ?? "—"}</p>
            <p className='truncate text-xs text-muted-foreground'>{row.original.primary_contact_phone ?? row.original.phone ?? ""}</p>
          </div>
        ),
      },
      {
        id: "paymentTermDays",
        header: t("fields.paymentTerm"),
        meta: { label: t("fields.paymentTerm"), exportValue: (row) => term(row) },
        cell: ({ row }) => <span className='whitespace-nowrap'>{term(row.original)}</span>,
      },
      {
        id: "products",
        header: t("fields.products"),
        enableSorting: false,
        meta: { label: t("fields.products"), align: "right", exportValue: (row) => row.products_count },
        cell: ({ row }) => <span className='tabular-nums'>{formatNumber(row.original.products_count ?? 0)}</span>,
      },
      {
        id: "status",
        header: t("fields.status"),
        meta: { label: t("fields.status"), exportValue: (row) => (row.status ? tStatuses(row.status as never) : "") },
        cell: ({ row }) => <SupplierStatusBadge status={row.original.status} />,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, tOpt, tStatuses],
  );

  const filters: GridFilter<ISupplier>[] = [
    { id: "status", label: t("fields.status"), options: SUPPLIER_STATUSES.map((status) => ({ value: status, label: tStatuses(status) })) },
  ];

  return (
    <CrudManager<ISupplier>
      mode='server'
      gridId='proveedores'
      namespace='Administre.supplier'
      icon={HiOutlineBuildingOffice2}
      eyebrow={tCrud("domains.inventory")}
      page={page}
      columns={columns}
      filters={filters}
      searchPlaceholder={t("searchPlaceholder")}
      stats={
        stats
          ? [
              { label: t("total"), value: formatNumber(stats.total), icon: HiOutlineBuildingOffice2 },
              { label: t("activeCount"), value: formatNumber(stats.active), icon: HiOutlineCheckCircle, tone: "success" },
              {
                label: t("blockedCount"),
                value: formatNumber(stats.blocked),
                icon: HiOutlineNoSymbol,
                tone: (stats.blocked ?? 0) > 0 ? "warning" : "default",
              },
              { label: t("creditCount"), value: formatNumber(stats.credit), icon: HiOutlineCreditCard },
              ...((stats.without_document ?? 0) > 0
                ? [
                    {
                      label: t("withoutDocument"),
                      value: formatNumber(stats.without_document),
                      icon: HiOutlineIdentification,
                      tone: "warning" as const,
                    },
                  ]
                : []),
            ]
          : undefined
      }
      rowLabel={(row) => row.display_name ?? row.name ?? `#${row.id}`}
      headerActions={
        <Link href={`${SUPPLIERS_HREF}/new`}
          className='inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90'>
          <HiOutlinePlusCircle className='h-4 w-4' aria-hidden='true' />
          {t("create")}
        </Link>
      }
      extraRowActions={(row) => [
        { label: t("view"), icon: HiOutlineEye, onSelect: () => router.push(`${SUPPLIERS_HREF}/${row.id}`) },
        { label: t("edit"), icon: HiOutlinePencilSquare, onSelect: () => router.push(`${SUPPLIERS_HREF}/${row.id}/edit`) },
        row.status === "ACTIVE"
          ? { label: tStatus("block"), icon: HiOutlineNoSymbol, onSelect: () => change(row, "BLOCKED") }
          : { label: tStatus("activate"), icon: HiOutlineCheckCircle, onSelect: () => change(row, "ACTIVE") },
      ]}
      onDelete={(id) => deleteSupplierServerAction(id)}
      onBulkDelete={(ids) => bulkDeleteSuppliersServerAction(ids)}
      onExportAll={(params) => exportSuppliersServerAction(params)}
    />
  );
};
