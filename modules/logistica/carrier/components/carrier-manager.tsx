/** @format */

"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@repo/ui/badges/scenes/badge";
import {
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineTruck,
} from "react-icons/hi2";
import { CrudManager } from "@/components/crud-manager";
import type { GridColumn } from "@/components/data-grid";
import { formatApiDate, createdWithin, formatMoney, formatNumber } from "@/lib/format";
import { RegisterCarrier, UpdateCarrier } from "./form";
import type { ICarrier } from "../models/carrier.interface";
import { deleteCarrierServerAction } from "@/app/[locale]/logistica/carriers/actions";

interface ICarrierManagerProps {
  initialData: ICarrier[];
}

/** Transportadoras con tarifas y tiempos máximos. */
export const CarrierManager = ({ initialData }: ICarrierManagerProps) => {
  const t = useTranslations("Administre.carrier");
  const tCommon = useTranslations("Administre.common");
  const tCrud = useTranslations("Crud");

  const columns = useMemo<GridColumn<ICarrier>[]>(
    () => [
      {
        id: "name",
        header: t("fields.name"),
        meta: { label: t("fields.name"), hideable: false, exportValue: (row) => row.name },
        cell: ({ row }) => <span className='font-semibold text-foreground'>{row.original.name ?? "—"}</span>,
      },
      {
        id: "code",
        header: t("fields.code"),
        meta: { label: t("fields.code"), exportValue: (row) => row.code },
        cell: ({ row }) => <span className='font-mono text-xs'>{row.original.code || "—"}</span>,
      },
      {
        id: "contactEmail",
        header: t("fields.contactEmail"),
        meta: { label: t("fields.contactEmail"), exportValue: (row) => row.contactEmail },
        cell: ({ row }) =>
          row.original.contactEmail ? (
            <a href={`mailto:${row.original.contactEmail}`} className='text-primary underline-offset-4 hover:underline'>
              {row.original.contactEmail}
            </a>
          ) : (
            "—"
          ),
      },
      {
        id: "baseRate",
        header: t("fields.baseRate"),
        meta: { label: t("fields.baseRate"), align: "right", exportValue: (row) => row.baseRate },
        cell: ({ row }) => <span className='tabular-nums'>{formatMoney(row.original.baseRate)}</span>,
      },
      {
        id: "ratePerKm",
        header: t("fields.ratePerKm"),
        meta: { label: t("fields.ratePerKm"), align: "right", exportValue: (row) => row.ratePerKm },
        cell: ({ row }) => <span className='tabular-nums'>{formatMoney(row.original.ratePerKm)}</span>,
      },
      {
        id: "maxDeliveryDays",
        header: t("fields.maxDeliveryDays"),
        meta: { label: t("fields.maxDeliveryDays"), align: "right", exportValue: (row) => row.maxDeliveryDays },
        cell: ({ row }) => <span className='tabular-nums'>{formatNumber(row.original.maxDeliveryDays)}</span>,
      },
      {
        id: "isActive",
        header: t("fields.isActive"),
        enableSorting: false,
        meta: { label: t("fields.isActive"), exportValue: (row) => (row.isActive === false ? tCommon("no") : tCommon("yes")) },
        cell: ({ row }) => (
          <Badge variant={row.original.isActive === false ? "outline" : "default"}>
            {row.original.isActive === false ? tCommon("inactive") : tCommon("active")}
          </Badge>
        ),
      },
      {
        id: "updatedAt",
        header: tCrud("updatedAt"),
        meta: { label: tCrud("updatedAt"), exportValue: (row) => formatApiDate(row.updatedAt ?? row.createdAt) },
        cell: ({ row }) => (
          <span className='whitespace-nowrap text-muted-foreground'>
            {formatApiDate(row.original.updatedAt ?? row.original.createdAt)}
          </span>
        ),
      },
    ],
    [t, tCommon, tCrud],
  );

  const now = Date.now();
  const stats = [
    { label: t("total"), value: initialData.length, icon: HiOutlineTruck },
      {
        label: tCrud("activeCount"),
        value: initialData.filter((item) => item.isActive !== false).length,
        icon: HiOutlineCheckCircle,
        tone: "success" as const,
      },
    {
      label: tCrud("recent"),
      value: initialData.filter((item) => createdWithin(item.createdAt, 30, now)).length,
      icon: HiOutlineCalendarDays,
      hint: tCrud("recentHint"),
    },
  ];

  return (
    <CrudManager<ICarrier>
      gridId='transportadoras'
      namespace='Administre.carrier'
      icon={HiOutlineTruck}
      eyebrow={tCrud("domains.logistics")}
      data={initialData}
      columns={columns}
      stats={stats}
      rowLabel={(row) => row.name ?? `#${row.id}`}
      searchText={(row) => (row.name ?? "") + " " + (row.code ?? "") + " " + (row.contactEmail ?? "")}
      renderForm={(item, close) =>
        item ? (
          <UpdateCarrier initialValues={item} handleClose={close} />
        ) : (
          <RegisterCarrier handleClose={close} />
        )}
      onDelete={(id) => deleteCarrierServerAction(id)}
    />
  );
};
