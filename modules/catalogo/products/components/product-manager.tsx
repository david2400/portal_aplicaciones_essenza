/** @format */

"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Modal } from "@repo/ui/modals/scenes/dialog/modal";
import { Buttons } from "@repo/ui/buttons/scenes";
import { Badge } from "@repo/ui/badges/scenes/badge";
import {
  HiOutlineArchiveBox,
  HiOutlineBanknotes,
  HiOutlineCheckBadge,
  HiOutlineCube,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineExclamationTriangle,
  HiOutlinePencilSquare,
  HiOutlineClipboardDocumentList,
  HiOutlinePlusCircle,
  HiOutlineTrash,
} from "react-icons/hi2";
import { DataGrid, type BulkAction, type GridColumn, type GridFilter, type RowAction } from "@/components/data-grid";
import { PRODUCT_STATUSES, statusOf, type ProductStatus } from "../models/product.interface";

const STATUS_VARIANT: Record<ProductStatus, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "secondary",
  ACTIVE: "default",
  INACTIVE: "outline",
  ARCHIVED: "destructive",
};
import { PageHeader } from "@/components/page-header";
import { StatCards } from "@/components/stat-cards";
import { confirm, notify } from "@/components/notifications";
import type { BulkResult, PageResult } from "@/shared/models/pagination";
import { RegisterProduct, UpdateProduct } from "./form";
import { ProductAttributesEditor } from "./product-attributes-editor";
import type { IAttributeDefinition, IProductTemplateDefinition } from "../models/product-attributes.interface";
import type { IProduct } from "../models/product.interface";
import { LOW_STOCK_THRESHOLD, type ProductStats } from "../stats";
import {
  bulkDeleteProductsServerAction,
  bulkSetAvailabilityServerAction,
  deleteProductServerAction,
  exportProductsServerAction,
} from "@/app/[locale]/catalogo/products/actions";

type NamedItem = { id?: number; name?: string };

const toLookup = (items: NamedItem[]) => new Map(items.map((item) => [item.id ?? -1, item.name ?? `#${item.id}`]));

const toOptions = (items: NamedItem[]) =>
  items
    .filter((item) => item.id != null)
    .map((item) => ({ id: String(item.id), value: String(item.id), label: item.name ?? `#${item.id}` }));

const moneyFormatter = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const formatMoney = (value?: number) => (value == null ? "—" : moneyFormatter.format(value));
const numberFormatter = new Intl.NumberFormat("es-CO");

/** Margen bruto sobre el precio de venta. */
const margin = (row: IProduct) =>
  row.unit_price && row.real_price != null ? (row.unit_price - row.real_price) / row.unit_price : null;

interface IProductManagerProps {
  page: PageResult<IProduct>;
  stats: ProductStats;
  brands: NamedItem[];
  categories: NamedItem[];
  subcategories: Array<NamedItem & { category_id?: number }>;
  suppliers: NamedItem[];
  templates: IProductTemplateDefinition[];
  attributes: IAttributeDefinition[];
}

export const ProductManager = ({
  page,
  stats,
  brands,
  categories,
  subcategories,
  suppliers,
  templates,
  attributes,
}: IProductManagerProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("Administre.product");
  const tp = useTranslations("Administre.productGrid");
  const tCommon = useTranslations("Administre.common");

  const [modal, setModal] = useState<{ open: boolean; item: IProduct | null }>({ open: false, item: null });
  const closeModal = () => setModal({ open: false, item: null });
  const [specs, setSpecs] = useState<IProduct | null>(null);
  const tSpecs = useTranslations("Administre.productAttributes");

  const lookups = useMemo(
    () => ({ brands: toLookup(brands), categories: toLookup(categories), subcategories: toLookup(subcategories) }),
    [brands, categories, subcategories],
  );

  const formOptions = useMemo(
    () => ({
      brands: toOptions(brands),
      categories: toOptions(categories),
      subcategories: toOptions(subcategories),
      suppliers: toOptions(suppliers),
    }),
    [brands, categories, subcategories, suppliers],
  );

  const label = (row: IProduct) => row.name ?? `#${row.id}`;

  const reportBulk = (result: BulkResult, successKey: "bulkDeleted" | "bulkUpdated") => {
    if (result.failed.length === 0) notify.success(tp(successKey, { count: result.succeeded }));
    else
      notify.warning(
        tp("bulkPartial", { ok: result.succeeded, failed: result.failed.length }),
        result.failed.slice(0, 3).map((failure) => failure.reason).join(" · "),
      );
    router.refresh();
  };

  const handleDelete = async (row: IProduct) => {
    if (row.id == null) return;
    const ok = await confirm({
      title: tCommon("deleteConfirmTitle"),
      description: tCommon("deleteConfirmText", { name: label(row) }),
      confirmLabel: tCommon("deleteConfirmButton"),
      tone: "danger",
    });
    if (!ok) return;
    const result = await deleteProductServerAction(row.id);
    if (result.success) {
      notify.success(tCommon("deletedSuccess"), label(row));
      router.refresh();
    } else notify.error(tCommon("errorTitle"), result.error);
  };

  const setAvailability = async (ids: number[], available: boolean) => {
    const result = await bulkSetAvailabilityServerAction(ids, available);
    if (result.success && result.data) reportBulk(result.data, "bulkUpdated");
    else if (!result.success) notify.error(tCommon("errorTitle"), result.error);
  };

  const idsOf = (rows: IProduct[]) => rows.map((row) => row.id).filter((id): id is number => id != null);

  const bulkActions: BulkAction<IProduct>[] = [
    { label: tp("markAvailable"), icon: HiOutlineEye, onAction: (rows) => setAvailability(idsOf(rows), true) },
    { label: tp("markUnavailable"), icon: HiOutlineEyeSlash, onAction: (rows) => setAvailability(idsOf(rows), false) },
    {
      label: tp("deleteSelected"),
      icon: HiOutlineTrash,
      tone: "danger",
      onAction: async (rows) => {
        const ids = idsOf(rows);
        const ok = await confirm({
          title: tp("bulkConfirmTitle", { count: ids.length }),
          description: tp("bulkConfirmText"),
          confirmLabel: tCommon("deleteConfirmButton"),
          tone: "danger",
        });
        if (!ok) return;
        const result = await bulkDeleteProductsServerAction(ids);
        if (result.success && result.data) reportBulk(result.data, "bulkDeleted");
        else if (!result.success) notify.error(tCommon("errorTitle"), result.error);
      },
    },
  ];

  const rowActions = (row: IProduct): RowAction[] => [
    { label: tCommon("edit"), icon: HiOutlinePencilSquare, onSelect: () => setModal({ open: true, item: row }) },
    { label: tSpecs("action"), icon: HiOutlineClipboardDocumentList, onSelect: () => setSpecs(row) },
    {
      label: row.available ? tp("markUnavailable") : tp("markAvailable"),
      icon: row.available ? HiOutlineEyeSlash : HiOutlineEye,
      onSelect: () => row.id != null && setAvailability([row.id], !row.available),
    },
    { label: tCommon("delete"), icon: HiOutlineTrash, tone: "danger", separated: true, onSelect: () => handleDelete(row) },
  ];

  const columns = useMemo<GridColumn<IProduct>[]>(
    () => [
      {
        id: "name",
        header: t("fields.name"),
        meta: { label: t("fields.name"), hideable: false, exportValue: (row) => row.name },
        cell: ({ row }) => (
          <div className='flex min-w-0 items-center gap-3'>
            {row.original.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={row.original.image_url}
                alt=''
                loading='lazy'
                className='h-10 w-10 shrink-0 rounded-lg border border-border object-cover'
              />
            ) : (
              <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground'>
                <HiOutlineCube className='h-5 w-5' aria-hidden='true' />
              </span>
            )}
            <div className='min-w-0'>
              <button
                type='button'
                onClick={() => setModal({ open: true, item: row.original })}
                className='truncate text-left font-semibold text-foreground underline-offset-4 hover:underline'>
                {row.original.name}
              </button>
              <p className='text-xs text-muted-foreground'>
                #{row.original.id}
                {row.original.slug ? ` · /${row.original.slug}` : ""}
                {row.original.is_combo ? ` · ${tp("combo")}` : ""}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "brandId",
        header: t("fields.brandId"),
        enableSorting: false,
        meta: { label: t("fields.brandId"), exportValue: (row) => lookups.brands.get(row.brand_id ?? -1) },
        cell: ({ row }) => lookups.brands.get(row.original.brand_id ?? -1) ?? "—",
      },
      {
        id: "categoryId",
        header: t("fields.categoryId"),
        enableSorting: false,
        meta: {
          label: t("fields.categoryId"),
          exportValue: (row) => lookups.categories.get(row.category_id ?? -1),
        },
        cell: ({ row }) => (
          <div className='min-w-0'>
            <p className='truncate'>{lookups.categories.get(row.original.category_id ?? -1) ?? "—"}</p>
            <p className='truncate text-xs text-muted-foreground'>
              {lookups.subcategories.get(row.original.subcategory_id ?? -1) ?? ""}
            </p>
          </div>
        ),
      },
      {
        id: "unitPrice",
        header: t("fields.unitPrice"),
        meta: { label: t("fields.unitPrice"), align: "right", exportValue: (row) => row.unit_price },
        cell: ({ row }) => <span className='tabular-nums font-medium'>{formatMoney(row.original.unit_price)}</span>,
      },
      {
        id: "realPrice",
        header: t("fields.realPrice"),
        meta: { label: t("fields.realPrice"), align: "right", defaultHidden: true, exportValue: (row) => row.real_price },
        cell: ({ row }) => <span className='tabular-nums'>{formatMoney(row.original.real_price)}</span>,
      },
      {
        id: "margin",
        header: tp("margin"),
        enableSorting: false,
        meta: {
          label: tp("margin"),
          align: "right",
          exportValue: (row) => {
            const value = margin(row);
            return value == null ? "" : `${(value * 100).toFixed(1)}%`;
          },
        },
        cell: ({ row }) => {
          const value = margin(row.original);
          if (value == null) return "—";
          return (
            <span className={value < 0 ? "font-medium text-destructive tabular-nums" : value < 0.15 ? "text-warning tabular-nums" : "tabular-nums"}>
              {(value * 100).toFixed(1)}%
            </span>
          );
        },
      },
      {
        id: "stock",
        header: t("fields.stock"),
        meta: { label: t("fields.stock"), align: "right", exportValue: (row) => row.stock },
        cell: ({ row }) => {
          const stock = row.original.stock ?? 0;
          if (stock <= 0) return <Badge variant='destructive'>{tp("outOfStock")}</Badge>;
          return (
            <span className='inline-flex items-center gap-1.5 tabular-nums'>
              {stock <= LOW_STOCK_THRESHOLD ? (
                <HiOutlineExclamationTriangle className='h-4 w-4 text-warning' aria-label={tp("lowStock")} />
              ) : null}
              {numberFormatter.format(stock)}
            </span>
          );
        },
      },
      {
        id: "status",
        header: t("fields.status"),
        meta: { label: t("fields.status"), exportValue: (row) => t(`statuses.${statusOf(row)}`) },
        cell: ({ row }) => {
          const status = statusOf(row.original);
          return <Badge variant={STATUS_VARIANT[status]}>{t(`statuses.${status}`)}</Badge>;
        },
      },
      {
        id: "skus",
        header: t("fields.skus"),
        enableSorting: false,
        meta: {
          label: t("fields.skus"),
          defaultHidden: true,
          exportValue: (row) => (row.skus ?? []).map((sku) => sku.code).join(" "),
        },
        cell: ({ row }) => {
          const skus = row.original.skus ?? [];
          const main = skus.find((sku) => sku.is_default) ?? skus[0];
          return main ? (
            <span className='font-mono text-xs text-muted-foreground'>
              {main.code}
              {skus.length > 1 ? ` +${skus.length - 1}` : ""}
            </span>
          ) : (
            "—"
          );
        },
      },
    ],
    [lookups, t, tp, tCommon],
  );

  const selectedCategory = searchParams.get("categoryId");
  const filters = useMemo<GridFilter<IProduct>[]>(
    () => [
      { id: "brandId", label: t("fields.brandId"), options: formOptions.brands.map(({ value, label }) => ({ value, label })) },
      {
        id: "categoryId",
        label: t("fields.categoryId"),
        resets: ["subcategory_id"],
        options: formOptions.categories.map(({ value, label }) => ({ value, label })),
      },
      {
        id: "subcategoryId",
        label: t("fields.subcategoryId"),
        // Si hay categoría elegida, solo sus subcategorías.
        options: subcategories
          .filter((item) => item.id != null && (!selectedCategory || String(item.category_id) === selectedCategory))
          .map((item) => ({ value: String(item.id), label: item.name ?? `#${item.id}` })),
      },
      {
        id: "status",
        label: t("fields.status"),
        options: PRODUCT_STATUSES.map((status) => ({ value: status, label: t(`statuses.${status}`) })),
      },
    ],
    [formOptions, subcategories, selectedCategory, t, tp],
  );

  const createButton = (
    <Buttons onClick={() => setModal({ open: true, item: null })} className='rounded-full'>
      <HiOutlinePlusCircle className='h-4 w-4' aria-hidden='true' />
      {t("create")}
    </Buttons>
  );

  return (
    <section className='flex w-full flex-col gap-6'>
      <PageHeader title={t("title")} description={t("description")} icon={HiOutlineCube} eyebrow={tp("eyebrow")} actions={createButton} />

      <div className='flex flex-col gap-5 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6'>
        <StatCards
          items={[
            { label: t("total"), value: numberFormatter.format(stats.total), icon: HiOutlineCube },
            {
              label: t("availableCount"),
              value: numberFormatter.format(stats.available),
              icon: HiOutlineCheckBadge,
              tone: "success",
              hint: tp("availableHint", { percent: stats.total ? Math.round((stats.available / stats.total) * 100) : 0 }),
            },
            {
              label: tp("stockAlerts"),
              value: numberFormatter.format(stats.outOfStock + stats.lowStock),
              icon: HiOutlineArchiveBox,
              tone: stats.outOfStock > 0 ? "danger" : stats.lowStock > 0 ? "warning" : "success",
              hint: tp("stockAlertsHint", { out: stats.outOfStock, low: stats.lowStock, threshold: LOW_STOCK_THRESHOLD }),
            },
            {
              label: tp("inventoryValue"),
              value: formatMoney(stats.inventoryValue),
              icon: HiOutlineBanknotes,
              hint: tp("inventoryValueHint"),
            },
          ]}
        />

        <DataGrid<IProduct>
          mode='server'
          embedded
          id='productos'
        caption={t("title")}
        data={page.items}
        pagination={{ page: page.page, size: page.size, total: page.total, totalPages: page.totalPages }}
        columns={columns}
        getRowId={(row) => String(row.id)}
        searchPlaceholder={tp("searchPlaceholder")}
        filters={filters}
        rowActions={rowActions}
        bulkActions={bulkActions}
        exportName='productos'
        onExportAll={async () => {
          const result = await exportProductsServerAction(Object.fromEntries(searchParams.entries()));
          if (!result.success) throw new Error(result.error);
          if (result.data?.truncated) notify.warning(tp("exportTruncated"));
          return result.data?.items ?? [];
        }}
        emptyState={{ title: t("emptyTitle"), description: t("emptyDescription"), action: createButton }}
      />
      </div>

      <Modal
        size='xl'
        title={modal.item ? t("editTitle") : t("createTitle")}
        open={modal.open}
        onOpenChange={(open) => !open && closeModal()}
        hideDefaultFooter={true}>
        {modal.open ? (
          modal.item ? (
            <UpdateProduct initialValues={modal.item} handleClose={closeModal} options={formOptions} />
          ) : (
            <RegisterProduct handleClose={closeModal} options={formOptions} />
          )
        ) : null}
      </Modal>

      <Modal
        size='xl'
        title={specs ? tSpecs("title", { name: specs.name ?? `#${specs.id}` }) : ""}
        open={specs != null}
        onOpenChange={(open) => !open && setSpecs(null)}
        hideDefaultFooter={true}>
        {specs?.id != null ? (
          <ProductAttributesEditor
            productId={specs.id}
            templates={templates}
            attributes={attributes}
            handleClose={() => setSpecs(null)}
          />
        ) : null}
      </Modal>
    </section>
  );
};
