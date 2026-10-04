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
  type MovementType,
} from "../models/inventory-movement.interface";

interface IInventoryMovementManagerProps {
  initialData: IInventoryMovement[];
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
export const InventoryMovementManager = ({ initialData, products, warehouses }: IInventoryMovementManagerProps) => {
  const t = useTranslations("Administre.inventoryMovement");
  const tCrud = useTranslations("Crud");

  const productNames = useMemo(() => toLookup(products), [products]);
  const warehouseNames = useMemo(() => toLookup(warehouses), [warehouses]);
  const productOptions = useMemo(() => toOptions(products), [products]);
  const warehouseOptions = useMemo(() => toOptions(warehouses), [warehouses]);

  const rows = useMemo<MovementRow[]>(
    () => initialData.map((movement, index) => ({ ...movement, id: index + 1 })),
    [initialData],
  );

  const sum = (type: MovementType) =>
    initialData.filter((movement) => movement.type === type).reduce((acc, movement) => acc + (movement.quantity ?? 0), 0);

  const warehouseLabel = (id?: number) => (id == null ? "—" : (warehouseNames.get(id) ?? `#${id}`));
  const productLabel = (row: MovementRow) => productNames.get(row.productId ?? -1) ?? `#${row.productId}`;
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
        id: "productId",
        accessorFn: (row) => productLabel(row),
        header: t("fields.productId"),
        meta: { label: t("fields.productId"), exportValue: (row) => productLabel(row) },
        cell: ({ row }) => <span className='font-semibold text-foreground'>{productLabel(row.original)}</span>,
      },
      {
        id: "route",
        header: `${t("fields.fromWarehouseId")} → ${t("fields.toWarehouseId")}`,
        enableSorting: false,
        meta: {
          label: `${t("fields.fromWarehouseId")} → ${t("fields.toWarehouseId")}`,
          exportValue: (row) => `${warehouseLabel(row.fromWarehouseId)} → ${warehouseLabel(row.toWarehouseId)}`,
        },
        cell: ({ row }) => (
          <span className='inline-flex items-center gap-1.5 text-sm'>
            {warehouseLabel(row.original.fromWarehouseId)}
            <HiOutlineArrowRight className='h-3.5 w-3.5 text-muted-foreground' aria-hidden='true' />
            {warehouseLabel(row.original.toWarehouseId)}
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
        id: "reason",
        header: t("fields.reason"),
        enableSorting: false,
        meta: { label: t("fields.reason"), exportValue: (row) => row.reason },
        cell: ({ row }) => row.original.reason || "—",
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [productNames, warehouseNames, t],
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
      id: "fromWarehouseId",
      label: t("fields.fromWarehouseId"),
      options: warehouseFilterOptions,
      accessor: (row) => row.fromWarehouseId,
    },
    {
      id: "toWarehouseId",
      label: t("fields.toWarehouseId"),
      options: warehouseFilterOptions,
      accessor: (row) => row.toWarehouseId,
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
        `${productLabel(row)} ${row.reason ?? ""} ${warehouseLabel(row.fromWarehouseId)} ${warehouseLabel(row.toWarehouseId)}`
      }
      renderForm={(_item, close) => (
        <RegisterInventoryMovement handleClose={close} products={productOptions} warehouses={warehouseOptions} />
      )}
    />
  );
};
