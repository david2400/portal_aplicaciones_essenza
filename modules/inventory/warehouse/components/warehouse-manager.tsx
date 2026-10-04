/** @format */

"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@repo/ui/badges/scenes/badge";
import { HiOutlineBuildingStorefront, HiOutlineCheckCircle, HiOutlineMapPin } from "react-icons/hi2";
import { CrudManager } from "@/components/crud-manager";
import type { GridColumn, GridFilter } from "@/components/data-grid";
import { RegisterWarehouse, UpdateWarehouse } from "./form";
import type { IWarehouse } from "../models/warehouse.interface";
import {
  bulkDeleteWarehousesServerAction,
  deleteWarehouseServerAction,
} from "@/app/[locale]/inventory/warehouses/actions";

interface IWarehouseManagerProps {
  initialData: IWarehouse[];
  /** Etiqueta "Ciudad, Departamento, País" por `cityId` (resuelta en el servidor). */
  cityLabels?: Record<number, string>;
}

/** Bodegas con ubicación (catálogo `parametros`), estado y borrado protegido por stock. */
export const WarehouseManager = ({ initialData, cityLabels = {} }: IWarehouseManagerProps) => {
  const t = useTranslations("Administre.warehouse");
  const tCommon = useTranslations("Administre.common");
  const tCrud = useTranslations("Crud");

  const location = (row: IWarehouse) => (row.cityId != null ? (cityLabels[row.cityId] ?? `#${row.cityId}`) : "");

  const columns = useMemo<GridColumn<IWarehouse>[]>(
    () => [
      {
        id: "code",
        header: t("fields.code"),
        meta: { label: t("fields.code"), hideable: false, exportValue: (row) => row.code },
        cell: ({ row }) => <span className='font-mono text-xs font-semibold text-foreground'>{row.original.code}</span>,
      },
      {
        id: "name",
        header: t("fields.name"),
        meta: { label: t("fields.name"), exportValue: (row) => row.name },
        cell: ({ row }) => <span className='font-semibold text-foreground'>{row.original.name ?? "—"}</span>,
      },
      {
        id: "location",
        header: t("fields.location"),
        enableSorting: false,
        meta: { label: t("fields.location"), exportValue: (row) => location(row) },
        cell: ({ row }) =>
          row.original.cityId != null ? (
            <span className='inline-flex items-center gap-1.5'>
              <HiOutlineMapPin className='h-4 w-4 text-muted-foreground' aria-hidden='true' />
              {location(row.original)}
            </span>
          ) : (
            <span className='text-xs italic text-muted-foreground'>{tCrud("noLocation")}</span>
          ),
      },
      {
        id: "address",
        header: t("fields.address"),
        meta: { label: t("fields.address"), exportValue: (row) => row.address },
        cell: ({ row }) => row.original.address || "—",
      },
      {
        id: "active",
        header: t("fields.active"),
        enableSorting: false,
        meta: { label: t("fields.active"), exportValue: (row) => (row.active === false ? tCommon("no") : tCommon("yes")) },
        cell: ({ row }) => (
          <Badge variant={row.original.active === false ? "outline" : "default"}>
            {row.original.active === false ? tCommon("inactive") : tCommon("active")}
          </Badge>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cityLabels, t, tCommon, tCrud],
  );

  const filters: GridFilter<IWarehouse>[] = [
    {
      id: "active",
      label: t("fields.active"),
      options: [
        { value: "true", label: tCommon("active") },
        { value: "false", label: tCommon("inactive") },
      ],
      accessor: (row) => String(row.active !== false),
    },
  ];

  const active = initialData.filter((item) => item.active !== false).length;
  const withoutLocation = initialData.filter((item) => item.cityId == null).length;

  return (
    <CrudManager<IWarehouse>
      gridId='bodegas'
      namespace='Administre.warehouse'
      icon={HiOutlineBuildingStorefront}
      eyebrow={tCrud("domains.inventory")}
      data={initialData}
      columns={columns}
      filters={filters}
      stats={[
        { label: t("total"), value: initialData.length, icon: HiOutlineBuildingStorefront },
        { label: tCrud("activeCount"), value: active, icon: HiOutlineCheckCircle, tone: "success" },
        {
          label: tCrud("withoutLocation"),
          value: withoutLocation,
          icon: HiOutlineMapPin,
          tone: withoutLocation > 0 ? "warning" : "success",
          hint: tCrud("withoutLocationHint"),
        },
      ]}
      rowLabel={(row) => row.name ?? row.code ?? `#${row.id}`}
      searchText={(row) => `${row.code ?? ""} ${row.name ?? ""} ${row.address ?? ""} ${location(row)}`}
      renderForm={(item, close) =>
        item ? <UpdateWarehouse initialValues={item} handleClose={close} /> : <RegisterWarehouse handleClose={close} />
      }
      onDelete={(id) => deleteWarehouseServerAction(id)}
      onBulkDelete={(ids) => bulkDeleteWarehousesServerAction(ids)}
    />
  );
};
