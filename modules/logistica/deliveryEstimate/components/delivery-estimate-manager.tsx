/** @format */

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Badge } from "@repo/ui/badges/scenes/badge";
import { HiOutlineCalendarDays, HiOutlineClock, HiOutlineTruck } from "react-icons/hi2";
import { CrudManager } from "@/components/crud-manager";
import type { GridColumn, GridFilter } from "@/components/data-grid";
import { notify } from "@/components/notifications";
import { FormDeliveryEstimate } from "../scenes/formDeliveryEstimate";
import { validationDeliveryEstimate, type DeliveryEstimateFormValues } from "../schemas/deliveryEstimate.schema";
import type { IDeliveryCarrier, IDeliveryEstimate } from "../models/deliveryEstimate.interface";
import {
  calculateDeliveryEstimateServerAction,
  deleteDeliveryEstimateServerAction,
} from "@/app/[locale]/logistica/delivery-estimates/actions";

const dateFormatter = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });

/** Formatea `LocalDate` (YYYY-MM-DD) sin desfase de zona horaria. */
const formatDate = (value?: string) => {
  if (!value) return "—";
  const [datePart] = value.split("T");
  const [y, m, d] = (datePart ?? "").split("-").map(Number);
  if (!y || !m || !d) return value;
  return dateFormatter.format(new Date(y, m - 1, d));
};

/** Valor inicial del campo `datetime-local`: ahora, en hora local. */
const nowInputValue = () => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

interface IDeliveryEstimateManagerProps {
  initialData: IDeliveryEstimate[];
  carriers: IDeliveryCarrier[];
}

/** Estimaciones de entrega: calculadora + histórico con filtros, exportación y depuración en lote. */
export const DeliveryEstimateManager = ({ initialData, carriers }: IDeliveryEstimateManagerProps) => {
  const router = useRouter();
  const t = useTranslations("Administre.deliveryEstimate");
  const tCommon = useTranslations("Administre.common");
  const tCrud = useTranslations("Crud");
  const validationSchema = validationDeliveryEstimate();

  const [lastResult, setLastResult] = useState<IDeliveryEstimate | null>(null);

  const carrierNames = useMemo(
    () => new Map(carriers.map((carrier) => [carrier.id ?? -1, carrier.name ?? `#${carrier.id}`])),
    [carriers],
  );
  const carrierName = (row: IDeliveryEstimate) => carrierNames.get(row.carrierId ?? -1) ?? "—";
  const route = (row: IDeliveryEstimate) => `${row.originAddress ?? "—"} → ${row.destinationAddress ?? "—"}`;

  const data = useMemo(() => [...initialData].sort((a, b) => (b.id ?? 0) - (a.id ?? 0)), [initialData]);
  const days = initialData.map((item) => item.estimatedDays).filter((value): value is number => value != null);
  const averageDays = days.length ? (days.reduce((acc, value) => acc + value, 0) / days.length).toFixed(1) : "—";
  const activeCarriers = carriers.filter((carrier) => carrier.isActive !== false).length;

  const handleCalculate = async (values: DeliveryEstimateFormValues) => {
    const shipmentDate = values.shipmentDate.length === 16 ? `${values.shipmentDate}:00` : values.shipmentDate;
    const response = await calculateDeliveryEstimateServerAction({
      carrier_id: values.carrierId,
      origin_address: values.originAddress,
      destination_address: values.destinationAddress,
      shipment_date: shipmentDate,
      is_business_days_only: values.isBusinessDaysOnly,
    });
    if (response.success) {
      setLastResult(response.data ?? null);
      notify.success(t("resultTitle"), formatDate(response.data?.estimatedDeliveryDate));
      router.refresh();
    } else {
      notify.error(tCommon("errorTitle"), response.error || tCommon("unexpectedError"));
    }
  };

  const columns = useMemo<GridColumn<IDeliveryEstimate>[]>(
    () => [
      {
        id: "carrierId",
        accessorFn: (row) => carrierName(row),
        header: t("fields.carrierId"),
        meta: { label: t("fields.carrierId"), hideable: false, exportValue: (row) => carrierName(row) },
        cell: ({ row }) => <span className='font-semibold text-foreground'>{carrierName(row.original)}</span>,
      },
      {
        id: "route",
        header: t("fields.route"),
        enableSorting: false,
        meta: { label: t("fields.route"), exportValue: (row) => route(row) },
        cell: ({ row }) => route(row.original),
      },
      {
        id: "shipmentDate",
        accessorFn: (row) => row.shipmentDate ?? "",
        header: t("fields.shipmentDate"),
        meta: { label: t("fields.shipmentDate"), exportValue: (row) => row.shipmentDate },
        cell: ({ row }) => formatDate(row.original.shipmentDate),
      },
      {
        id: "estimatedDeliveryDate",
        accessorFn: (row) => row.estimatedDeliveryDate ?? "",
        header: t("fields.estimatedDeliveryDate"),
        meta: { label: t("fields.estimatedDeliveryDate"), exportValue: (row) => row.estimatedDeliveryDate },
        cell: ({ row }) => (
          <span className='font-semibold text-foreground'>{formatDate(row.original.estimatedDeliveryDate)}</span>
        ),
      },
      {
        id: "window",
        header: t("fields.window"),
        enableSorting: false,
        meta: {
          label: t("fields.window"),
          defaultHidden: true,
          exportValue: (row) => `${row.minDeliveryDate ?? ""} – ${row.maxDeliveryDate ?? ""}`,
        },
        cell: ({ row }) => `${formatDate(row.original.minDeliveryDate)} – ${formatDate(row.original.maxDeliveryDate)}`,
      },
      {
        id: "estimatedDays",
        accessorFn: (row) => row.estimatedDays ?? 0,
        header: t("fields.estimatedDays"),
        meta: { label: t("fields.estimatedDays"), align: "right", exportValue: (row) => row.estimatedDays },
        cell: ({ row }) => row.original.estimatedDays ?? "—",
      },
      {
        id: "isBusinessDaysOnly",
        header: t("fields.isBusinessDaysOnly"),
        enableSorting: false,
        meta: {
          label: t("fields.isBusinessDaysOnly"),
          exportValue: (row) => (row.isBusinessDaysOnly ? tCommon("yes") : tCommon("no")),
        },
        cell: ({ row }) => (
          <Badge variant={row.original.isBusinessDaysOnly ? "default" : "outline"}>
            {row.original.isBusinessDaysOnly ? tCommon("yes") : tCommon("no")}
          </Badge>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [carrierNames, t, tCommon],
  );

  const filters: GridFilter<IDeliveryEstimate>[] = [
    {
      id: "carrierId",
      label: t("fields.carrierId"),
      options: carriers
        .filter((carrier) => carrier.id != null)
        .map((carrier) => ({ value: String(carrier.id), label: carrier.name ?? `#${carrier.id}` })),
      accessor: (row) => row.carrierId,
    },
    {
      id: "isBusinessDaysOnly",
      label: t("fields.isBusinessDaysOnly"),
      options: [
        { value: "true", label: tCommon("yes") },
        { value: "false", label: tCommon("no") },
      ],
      accessor: (row) => String(Boolean(row.isBusinessDaysOnly)),
    },
  ];

  return (
    <CrudManager<IDeliveryEstimate>
      gridId='estimaciones-entrega'
      namespace='Administre.deliveryEstimate'
      icon={HiOutlineCalendarDays}
      eyebrow={tCrud("domains.logistics")}
      data={data}
      columns={columns}
      filters={filters}
      stats={[
        { label: t("total"), value: initialData.length, icon: HiOutlineCalendarDays },
        { label: t("averageDays"), value: averageDays, icon: HiOutlineClock },
        {
          label: t("carriersCount"),
          value: activeCarriers,
          icon: HiOutlineTruck,
          tone: activeCarriers === 0 ? "warning" : "default",
        },
      ]}
      rowLabel={(row) => `#${row.id}`}
      searchPlaceholder={t("searchPlaceholder")}
      searchText={(row) => `${carrierName(row)} ${route(row)}`}
      onDelete={(id) => deleteDeliveryEstimateServerAction(id)}>
      <div className='grid gap-4 lg:grid-cols-3'>
        <div className='rounded-xl border border-border/70 bg-background/60 p-5 lg:col-span-2'>
          <h3 className='text-base font-semibold text-foreground'>{t("calculatorTitle")}</h3>
          <p className='mb-4 mt-1 text-sm text-muted-foreground'>{t("calculatorDescription")}</p>
          {activeCarriers === 0 ? (
            <p role='status' className='text-sm text-muted-foreground'>
              {t("noCarriers")}
            </p>
          ) : (
            <FormDeliveryEstimate
              initialValues={{
                carrierId: "",
                originAddress: "",
                destinationAddress: "",
                shipmentDate: nowInputValue(),
                isBusinessDaysOnly: "true",
              }}
              validationSchema={validationSchema}
              onSubmit={handleCalculate}
              carriers={carriers}
            />
          )}
        </div>

        <div
          aria-live='polite'
          className='flex flex-col justify-center rounded-xl border border-primary/30 bg-primary/5 p-5'>
          {lastResult ? (
            <dl className='space-y-2 text-sm'>
              <dt className='text-muted-foreground'>{t("resultTitle")}</dt>
              <dd className='text-3xl font-semibold text-foreground'>{formatDate(lastResult.estimatedDeliveryDate)}</dd>
              <dd className='text-muted-foreground'>
                {t("resultWindow", {
                  min: formatDate(lastResult.minDeliveryDate),
                  max: formatDate(lastResult.maxDeliveryDate),
                })}
              </dd>
              <dd className='text-muted-foreground'>{t("resultDays", { days: lastResult.estimatedDays ?? "—" })}</dd>
            </dl>
          ) : (
            <p className='text-sm text-muted-foreground'>{t("resultEmpty")}</p>
          )}
        </div>
      </div>
    </CrudManager>
  );
};
