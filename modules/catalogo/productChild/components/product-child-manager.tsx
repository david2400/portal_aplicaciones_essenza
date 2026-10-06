/** @format */

"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Badge } from "@repo/ui/badges/scenes/badge";
import {
  HiOutlineCheckCircle,
  HiOutlineCube,
  HiOutlineCurrencyDollar,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineExclamationTriangle,
  HiOutlineSquares2X2,
} from "react-icons/hi2";
import { CrudManager } from "@/components/crud-manager";
import type { GridColumn, GridFilter } from "@/components/data-grid";
import { confirm, notify } from "@/components/notifications";
import { formatMoney } from "@/lib/format";
import { ProductChildForm } from "./form";
import {
  LOW_STOCK_THRESHOLD,
  stockLevel,
  type INamedItem,
  type IProductChild,
  type StockLevel,
} from "../models/productChild.interface";
import {
  bulkDeleteProductChildrenServerAction,
  deleteProductChildServerAction,
  updateProductChildServerAction,
} from "@/app/[locale]/catalogo/variants/actions";

interface IProductChildManagerProps {
  initialData: IProductChild[];
  products: INamedItem[];
}

const STOCK_VARIANT: Record<StockLevel, "default" | "secondary" | "destructive" | "outline"> = {
  out: "destructive",
  low: "secondary",
  ok: "outline",
};

/** Variantes de producto: stock con alertas, precio, disponibilidad individual y en lote. */
export const ProductChildManager = ({ initialData, products }: IProductChildManagerProps) => {
  const router = useRouter();
  const t = useTranslations("Administre.productChild");
  const tCommon = useTranslations("Administre.common");
  const tCrud = useTranslations("Crud");

  const productNames = useMemo(
    () => new Map(products.map((product) => [product.id ?? -1, product.name ?? `#${product.id}`])),
    [products],
  );
  const productName = (row: IProductChild) => productNames.get(row.product_id ?? -1) ?? `#${row.product_id ?? "—"}`;

  const out = initialData.filter((row) => stockLevel(row.stock) === "out").length;
  const low = initialData.filter((row) => stockLevel(row.stock) === "low").length;
  const available = initialData.filter((row) => row.available !== false).length;
  const inventoryValue = initialData.reduce((acc, row) => acc + (row.stock ?? 0) * (row.unit_price ?? 0), 0);

  /** El PUT valida el payload completo: se reenvía la variante con el cambio. */
  const setAvailability = (row: IProductChild, value: boolean) =>
    updateProductChildServerAction({
      id: row.id as number,
      product_id: row.product_id as number,
      name: row.name ?? "",
      description: row.description,
      stock: row.stock ?? 0,
      unit_price: row.unit_price ?? 0,
      image_url: row.image_url,
      available: value,
    });

  const toggleOne = async (row: IProductChild) => {
    if (row.id == null) return;
    const next = row.available === false;
    const result = await setAvailability(row, next);
    if (result.success) {
      notify.success(next ? t("enabledOk") : t("disabledOk"), row.name);
      router.refresh();
    } else {
      notify.error(tCommon("errorTitle"), result.error || tCommon("unexpectedError"));
    }
  };

  const bulkAvailability = async (rows: IProductChild[], value: boolean) => {
    const targets = rows.filter((row) => row.id != null && (row.available !== false) !== value);
    if (targets.length === 0) {
      notify.info(t("nothingToChange"));
      return;
    }
    const ok = await confirm({
      title: value ? t("bulkEnableTitle", { count: targets.length }) : t("bulkDisableTitle", { count: targets.length }),
      confirmLabel: value ? t("enable") : t("disable"),
    });
    if (!ok) return;
    let succeeded = 0;
    for (let index = 0; index < targets.length; index += 5) {
      const results = await Promise.allSettled(targets.slice(index, index + 5).map((row) => setAvailability(row, value)));
      succeeded += results.filter((result) => result.status === "fulfilled" && result.value.success).length;
    }
    const failed = targets.length - succeeded;
    if (failed === 0) notify.success(tCrud("bulkUpdated", { count: succeeded }));
    else notify.warning(tCrud("bulkPartial", { ok: succeeded, failed }));
    router.refresh();
  };

  const columns = useMemo<GridColumn<IProductChild>[]>(
    () => [
      {
        id: "name",
        accessorFn: (row) => row.name ?? "",
        header: t("fields.name"),
        meta: { label: t("fields.name"), hideable: false, exportValue: (row) => row.name },
        cell: ({ row }) => (
          <div className='flex min-w-0 items-center gap-3'>
            {row.original.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={row.original.image_url}
                alt=''
                className='h-10 w-10 shrink-0 rounded-lg border border-border object-cover'
              />
            ) : (
              <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-dashed border-border'>
                <HiOutlineCube className='h-4 w-4 text-muted-foreground' aria-hidden='true' />
              </span>
            )}
            <div className='min-w-0'>
              <p className='truncate font-semibold text-foreground'>{row.original.name}</p>
              {row.original.description ? (
                <p className='truncate text-xs text-muted-foreground'>{row.original.description}</p>
              ) : null}
            </div>
          </div>
        ),
      },
      {
        id: "product_id",
        accessorFn: (row) => productName(row),
        header: t("fields.productId"),
        meta: { label: t("fields.productId"), exportValue: (row) => productName(row) },
        cell: ({ row }) => productName(row.original),
      },
      {
        id: "unit_price",
        accessorFn: (row) => row.unit_price ?? 0,
        header: t("fields.unitPrice"),
        meta: { label: t("fields.unitPrice"), align: "right", exportValue: (row) => row.unit_price },
        cell: ({ row }) => <span className='tabular-nums'>{formatMoney(row.original.unit_price)}</span>,
      },
      {
        id: "stock",
        accessorFn: (row) => row.stock ?? 0,
        header: t("fields.stock"),
        meta: { label: t("fields.stock"), align: "right", exportValue: (row) => row.stock ?? 0 },
        cell: ({ row }) => {
          const level = stockLevel(row.original.stock);
          return (
            <Badge variant={STOCK_VARIANT[level]} className='tabular-nums'>
              {row.original.stock ?? 0}
              {level !== "ok" ? ` · ${t(`stockLevels.${level}`)}` : ""}
            </Badge>
          );
        },
      },
      {
        id: "available",
        header: t("fields.available"),
        enableSorting: false,
        meta: {
          label: t("fields.available"),
          exportValue: (row) => (row.available === false ? tCommon("no") : tCommon("yes")),
        },
        cell: ({ row }) => (
          <Badge variant={row.original.available === false ? "outline" : "default"}>
            {row.original.available === false ? tCommon("inactive") : tCommon("active")}
          </Badge>
        ),
      },
      {
        id: "updatedAt",
        accessorFn: (row) => row.updated_at ?? row.created_at ?? "",
        header: tCrud("updatedAt"),
        meta: { label: tCrud("updatedAt"), defaultHidden: true, exportValue: (row) => row.updated_at ?? row.created_at },
        cell: ({ row }) => {
          const value = row.original.updated_at ?? row.original.created_at;
          return value ? new Date(value).toLocaleDateString("es-CO") : "—";
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [productNames, t, tCommon, tCrud],
  );

  const filters: GridFilter<IProductChild>[] = [
    {
      id: "product_id",
      label: t("fields.productId"),
      options: products
        .filter((product) => product.id != null)
        .map((product) => ({ value: String(product.id), label: product.name ?? `#${product.id}` })),
      accessor: (row) => row.product_id,
    },
    {
      id: "stock",
      label: t("fields.stock"),
      options: (["out", "low", "ok"] as const).map((level) => ({ value: level, label: t(`stockLevels.${level}`) })),
      accessor: (row) => stockLevel(row.stock),
    },
    {
      id: "available",
      label: t("fields.available"),
      options: [
        { value: "true", label: tCommon("active") },
        { value: "false", label: tCommon("inactive") },
      ],
      accessor: (row) => String(row.available !== false),
    },
  ];

  return (
    <CrudManager<IProductChild>
      gridId='variantes'
      namespace='Administre.productChild'
      icon={HiOutlineSquares2X2}
      eyebrow={tCrud("domains.catalog")}
      data={initialData}
      columns={columns}
      filters={filters}
      stats={[
        { label: t("total"), value: initialData.length, icon: HiOutlineSquares2X2 },
        { label: tCrud("activeCount"), value: available, icon: HiOutlineCheckCircle, tone: "success" },
        {
          label: t("stockAlerts"),
          value: out + low,
          icon: HiOutlineExclamationTriangle,
          tone: out > 0 ? "danger" : low > 0 ? "warning" : "success",
          hint: t("stockAlertsHint", { out, low, threshold: LOW_STOCK_THRESHOLD }),
        },
        { label: t("inventoryValue"), value: formatMoney(inventoryValue), icon: HiOutlineCurrencyDollar },
      ]}
      rowLabel={(row) => row.name ?? `#${row.id}`}
      searchPlaceholder={t("searchPlaceholder")}
      searchText={(row) => `${row.name ?? ""} ${row.description ?? ""} ${productName(row)}`}
      extraRowActions={(row) => [
        {
          label: row.available === false ? t("enable") : t("disable"),
          icon: row.available === false ? HiOutlineEye : HiOutlineEyeSlash,
          onSelect: () => void toggleOne(row),
        },
      ]}
      extraBulkActions={[
        { label: t("enable"), icon: HiOutlineEye, onAction: (rows) => bulkAvailability(rows, true) },
        { label: t("disable"), icon: HiOutlineEyeSlash, onAction: (rows) => bulkAvailability(rows, false) },
      ]}
      renderForm={(item, close) => <ProductChildForm item={item} products={products} handleClose={close} />}
      onDelete={(id) => deleteProductChildServerAction(id)}
      onBulkDelete={(ids) => bulkDeleteProductChildrenServerAction(ids)}
    />
  );
};
