/** @format */

"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import classNames from "classnames";
import { Modal } from "@repo/ui/modals/scenes/dialog/modal";
import { Buttons } from "@repo/ui/buttons/scenes";
import { Badge } from "@repo/ui/badges/scenes/badge";
import {
  HiOutlineArrowsRightLeft,
  HiOutlineArrowDownTray,
  HiOutlineArrowUpTray,
  HiOutlinePlusCircle,
} from "react-icons/hi2";
import { DataTable } from "@/components/data-table";
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

const TYPE_VARIANT: Record<MovementType, "default" | "secondary" | "outline"> = {
  ENTRY: "default",
  EXIT: "outline",
  TRANSFER: "secondary",
};

const toLookup = (items: INamedItem[]) =>
  new Map(items.map((item) => [item.id ?? -1, item.name ?? `#${item.id}`]));

const toOptions = (items: INamedItem[]) =>
  items
    .filter((item) => item.id != null)
    .map((item) => ({ id: String(item.id), value: String(item.id), label: item.name ?? `#${item.id}` }));

export const InventoryMovementManager = ({
  initialData,
  products,
  warehouses,
}: IInventoryMovementManagerProps) => {
  const t = useTranslations("Administre.inventoryMovement");

  const [openCreate, setOpenCreate] = useState(false);
  const [typeFilter, setTypeFilter] = useState<"ALL" | MovementType>("ALL");

  const productNames = useMemo(() => toLookup(products), [products]);
  const warehouseNames = useMemo(() => toLookup(warehouses), [warehouses]);
  const productOptions = useMemo(() => toOptions(products), [products]);
  const warehouseOptions = useMemo(() => toOptions(warehouses), [warehouses]);

  const metrics = useMemo(() => {
    const sum = (type: MovementType) =>
      initialData
        .filter((movement) => movement.type === type)
        .reduce((acc, movement) => acc + (movement.quantity ?? 0), 0);
    return { ENTRY: sum("ENTRY"), EXIT: sum("EXIT"), TRANSFER: sum("TRANSFER") };
  }, [initialData]);

  const data = useMemo(
    () => (typeFilter === "ALL" ? initialData : initialData.filter((m) => m.type === typeFilter)),
    [initialData, typeFilter],
  );

  const warehouseLabel = (id?: number) => (id == null ? "—" : warehouseNames.get(id) ?? `#${id}`);

  const columns: ColumnDef<IInventoryMovement>[] = [
    {
      accessorKey: "type",
      header: t("fields.type"),
      cell: ({ row }) => {
        const type = row.original.type as MovementType;
        return (
          <Badge variant={TYPE_VARIANT[type] ?? "outline"}>
            {MOVEMENT_TYPES.includes(type) ? t(`types.${type}`) : row.original.type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "productId",
      header: t("fields.productId"),
      cell: ({ row }) => (
        <span className='font-semibold text-foreground'>
          {productNames.get(row.original.productId ?? -1) ?? `#${row.original.productId}`}
        </span>
      ),
    },
    {
      accessorKey: "fromWarehouseId",
      header: t("fields.fromWarehouseId"),
      cell: ({ row }) => warehouseLabel(row.original.fromWarehouseId),
    },
    {
      accessorKey: "toWarehouseId",
      header: t("fields.toWarehouseId"),
      cell: ({ row }) => warehouseLabel(row.original.toWarehouseId),
    },
    { accessorKey: "quantity", header: t("fields.quantity") },
    {
      accessorKey: "reason",
      header: t("fields.reason"),
      cell: ({ row }) => row.original.reason || "—",
    },
  ];

  const summaryCards = [
    { icon: HiOutlineArrowDownTray, label: t("entryUnits"), value: metrics.ENTRY },
    { icon: HiOutlineArrowUpTray, label: t("exitUnits"), value: metrics.EXIT },
    { icon: HiOutlineArrowsRightLeft, label: t("transferUnits"), value: metrics.TRANSFER },
  ];

  const filters: ("ALL" | MovementType)[] = ["ALL", ...MOVEMENT_TYPES];

  return (
    <section className='flex w-full flex-col gap-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-4'>
          <div className='rounded-2xl bg-primary/10 p-3'>
            <HiOutlineArrowsRightLeft className='h-7 w-7 text-primary' aria-hidden='true' />
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

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
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

      <div role='group' aria-label={t("filterLabel")} className='flex flex-wrap gap-2'>
        {filters.map((filter) => (
          <button
            key={filter}
            type='button'
            aria-pressed={typeFilter === filter}
            onClick={() => setTypeFilter(filter)}
            className={classNames(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              typeFilter === filter
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}>
            {filter === "ALL" ? t("allTypes") : t(`types.${filter}`)}
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
        {openCreate ? (
          <RegisterInventoryMovement
            handleClose={() => setOpenCreate(false)}
            products={productOptions}
            warehouses={warehouseOptions}
          />
        ) : null}
      </Modal>
    </section>
  );
};
