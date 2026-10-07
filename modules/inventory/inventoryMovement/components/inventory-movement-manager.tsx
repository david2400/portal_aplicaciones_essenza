/** @format */

"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@repo/ui/badges/scenes/badge";
import {
  HiOutlineArrowDownTray,
  HiOutlineArrowRight,
  HiOutlineArrowsRightLeft,
  HiOutlineArrowUpTray,
} from "react-icons/hi2";
import { CrudManager } from "@/components/crud-manager";
import type { GridColumn, GridFilter } from "@/components/data-grid";
import { RegisterInventoryMovement } from "./form";
import {
  MOVEMENT_TYPES,
  type IInventoryMovement,
  type INamedItem,
  type ISkuName,
  REFERENCE_TYPES,
  type MovementType,
} from "../models/inventory-movement.interface";

interface IInventoryMovementManagerProps {
  initialData: IInventoryMovement[];
  /** SKUs que aparecen en el kardex (nombre y código). */
  skus: ISkuName[];
  /** Productos de movimientos antiguos sin SKU. */
  products: INamedItem[];
  warehouses: INamedItem[];
}

/** El API no expone `id`: se usa la posición como clave estable de la fila. */
type MovementRow = IInventoryMovement & { id: number };

const TYPE_VARIANT: Record<MovementType, "default" | "secondary" | "outline"> = {
  ENTRY: "default",
  EXIT: "outline",
  TRANSFER: "secondary",
};

const toLookup = (items: INamedItem[]) => new Map(items.map((item) => [item.id ?? -1, item.name ?? `#${item.id}`]));

const toOptions = (items: INamedItem[]) =>
  items
    .filter((item) => item.id != null)
    .map((item) => ({ id: String(item.id), value: String(item.id), label: item.name ?? `#${item.id}` }));

/** Kardex de movimientos (entradas, salidas, traslados): registro inmutable con filtros y exportación. */
export const InventoryMovementManager = ({ initialData, skus, products, warehouses }: IInventoryMovementManagerProps) => {
  const t = useTranslations("Administre.inventoryMovement");
  const tCrud = useTranslations("Crud");

  const productNames = useMemo(() => toLookup(products), [products]);
  const warehouseNames = useMemo(() => toLookup(warehouses), [warehouses]);
  const skuNames = useMemo(() => new Map(skus.map((sku) => [sku.sku_id ?? -1, sku])), [skus]);
  const warehouseOptions = useMemo(() => toOptions(warehouses), [warehouses]);

  const rows = useMemo<MovementRow[]>(
    () => initialData.map((movement, index) => ({ ...movement, id: index + 1 })),
    [initialData],
  );

  const sum = (type: MovementType) =>
    initialData.filter((movement) => movement.type === type).reduce((acc, movement) => acc + (movement.quantity ?? 0), 0);

  const warehouseLabel = (id?: number) => (id == null ? "—" : (warehouseNames.get(id) ?? `#${id}`));
  const productLabel = (row: MovementRow) =>
    (row.sku_id != null ? skuNames.get(row.sku_id)?.name : undefined) ??
    productNames.get(row.product_id ?? -1) ??
    `#${row.product_id}`;
  const skuLabel = (row: MovementRow) => (row.sku_id == null ? "" : (skuNames.get(row.sku_id)?.code ?? ""));
  const sourceLabel = (row: MovementRow) =>
    row.reference_type && (REFERENCE_TYPES as readonly string[]).includes(row.reference_type)
      ? t(`sources.${row.reference_type as (typeof REFERENCE_TYPES)[number]}`)
      : t("sources.MANUAL");
  const typeLabel = (row: MovementRow) =>
    MOVEMENT_TYPES.includes(row.type as MovementType) ? t(`types.${row.type as MovementType}`) : row.type;

  const columns = useMemo<GridColumn<MovementRow>[]>(
    () => [
      {
        id: "type",
        header: t("fields.type"),
        enableSorting: false,
        meta: { label: t("fields.type"), hideable: false, exportValue: (row) => typeLabel(row) },
        cell: ({ row }) => (
          <Badge variant={TYPE_VARIANT[row.original.type as MovementType] ?? "outline"}>{typeLabel(row.original)}</Badge>
        ),
      },
      {
        id: "product_id",
        accessorFn: (row) => productLabel(row),
        header: t("fields.productId"),
        meta: { label: t("fields.productId"), exportValue: (row) => productLabel(row) },
        cell: ({ row }) => (
          <div className='min-w-0'>
            <span className='font-semibold text-foreground'>{productLabel(row.original)}</span>
            {skuLabel(row.original) ? (
              <p className='font-mono text-xs text-muted-foreground'>{skuLabel(row.original)}</p>
            ) : null}
          </div>
        ),
      },
      {
        id: "route",
        header: `${t("fields.fromWarehouseId")} → ${t("fields.toWarehouseId")}`,
        enableSorting: false,
        meta: {
          label: `${t("fields.fromWarehouseId")} → ${t("fields.toWarehouseId")}`,
          exportValue: (row) => `${warehouseLabel(row.from_warehouse_id)} → ${warehouseLabel(row.to_warehouse_id)}`,
        },
        cell: ({ row }) => (
          <span className='inline-flex items-center gap-1.5 text-sm'>
            {warehouseLabel(row.original.from_warehouse_id)}
            <HiOutlineArrowRight className='h-3.5 w-3.5 text-muted-foreground' aria-hidden='true' />
            {warehouseLabel(row.original.to_warehouse_id)}
          </span>
        ),
      },
      {
        id: "quantity",
        accessorFn: (row) => row.quantity ?? 0,
        header: t("fields.quantity"),
        meta: { label: t("fields.quantity"), align: "right", exportValue: (row) => row.quantity },
        cell: ({ row }) => {
          const sign = row.original.type === "ENTRY" ? "+" : row.original.type === "EXIT" ? "−" : "";
          return (
            <span className='font-semibold tabular-nums text-foreground'>
              {sign}
              {row.original.quantity ?? 0}
            </span>
          );
        },
      },
      {
        id: "source",
        header: t("fields.source"),
        enableSorting: false,
        meta: { label: t("fields.source"), exportValue: (row) => sourceLabel(row) },
        cell: ({ row }) => <Badge variant='outline'>{sourceLabel(row.original)}</Badge>,
      },
      {
        id: "reason",
        header: t("fields.reason"),
        enableSorting: false,
        meta: { label: t("fields.reason"), exportValue: (row) => row.reason },
        cell: ({ row }) => row.original.reason || "—",
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [productNames, warehouseNames, skuNames, t],
  );

  const warehouseFilterOptions = warehouses
    .filter((item) => item.id != null)
    .map((item) => ({ value: String(item.id), label: item.name ?? `#${item.id}` }));

  const filters: GridFilter<MovementRow>[] = [
    {
      id: "type",
      label: t("fields.type"),
      options: MOVEMENT_TYPES.map((type) => ({ value: type, label: t(`types.${type}`) })),
      accessor: (row) => row.type,
    },
    {
      id: "from_warehouse_id",
      label: t("fields.fromWarehouseId"),
      options: warehouseFilterOptions,
      accessor: (row) => row.from_warehouse_id,
    },
    {
      id: "to_warehouse_id",
      label: t("fields.toWarehouseId"),
      options: warehouseFilterOptions,
      accessor: (row) => row.to_warehouse_id,
    },
  ];

  return (
    <CrudManager<MovementRow>
      gridId='movimientos-inventario'
      namespace='Administre.inventoryMovement'
      icon={HiOutlineArrowsRightLeft}
      eyebrow={tCrud("domains.inventory")}
      data={rows}
      columns={columns}
      filters={filters}
      editable={false}
      stats={[
        { label: t("entryUnits"), value: sum("ENTRY"), icon: HiOutlineArrowDownTray, tone: "success" },
        { label: t("exitUnits"), value: sum("EXIT"), icon: HiOutlineArrowUpTray, tone: "warning" },
        { label: t("transferUnits"), value: sum("TRANSFER"), icon: HiOutlineArrowsRightLeft },
      ]}
      rowLabel={(row) => productLabel(row)}
      searchPlaceholder={t("searchPlaceholder")}
      searchText={(row) =>
        `${productLabel(row)} ${row.reason ?? ""} ${warehouseLabel(row.from_warehouse_id)} ${warehouseLabel(row.to_warehouse_id)}`
      }
      renderForm={(_item, close) => (
        <RegisterInventoryMovement
          handleClose={close}
          warehouses={warehouseOptions}
        />
      )}
    />
  );
};
