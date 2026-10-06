/** @format */

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Badge } from "@repo/ui/badges/scenes/badge";
import { HiOutlineCalculator, HiOutlineCurrencyDollar, HiOutlineTruck } from "react-icons/hi2";
import { CrudManager } from "@/components/crud-manager";
import type { GridColumn, GridFilter } from "@/components/data-grid";
import { notify } from "@/components/notifications";
import { FormShippingCost } from "../scenes/formShippingCost";
import { validationShippingCost, type ShippingCostFormValues } from "../schemas/shippingCost.schema";
import type { IShippingCarrier, IShippingCost } from "../models/shippingCost.interface";
import {
  calculateShippingCostServerAction,
  deleteShippingCostServerAction,
} from "@/app/[locale]/logistica/shipping-costs/actions";

const moneyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});
const formatMoney = (value?: number) => (value == null ? "—" : moneyFormatter.format(value));
const formatNumber = (value?: number, unit = "") => (value == null ? "—" : `${value}${unit}`);

interface IShippingCostManagerProps {
  initialData: IShippingCost[];
  carriers: IShippingCarrier[];
}

/** Cotizaciones de envío: calculadora en vivo + histórico con filtros, exportación y depuración en lote. */
export const ShippingCostManager = ({ initialData, carriers }: IShippingCostManagerProps) => {
  const router = useRouter();
  const t = useTranslations("Administre.shippingCost");
  const tCommon = useTranslations("Administre.common");
  const tCrud = useTranslations("Crud");
  const validationSchema = validationShippingCost();

  const [lastResult, setLastResult] = useState<IShippingCost | null>(null);

  const carrierNames = useMemo(
    () => new Map(carriers.map((carrier) => [carrier.id ?? -1, carrier.name ?? `#${carrier.id}`])),
    [carriers],
  );
  const carrierName = (row: IShippingCost) => carrierNames.get(row.carrier_id ?? -1) ?? "—";

  const data = useMemo(() => [...initialData].sort((a, b) => (b.id ?? 0) - (a.id ?? 0)), [initialData]);
  const costs = initialData.map((item) => item.calculated_cost ?? 0);
  const average = costs.length ? costs.reduce((acc, value) => acc + value, 0) / costs.length : undefined;
  const activeCarriers = carriers.filter((carrier) => carrier.is_active !== false).length;

  const handleCalculate = async (values: ShippingCostFormValues) => {
    const response = await calculateShippingCostServerAction({
      carrier_id: values.carrier_id,
      origin_address: values.origin_address,
      destination_address: values.destination_address,
      weight: values.weight,
      volume: values.volume,
    });
    if (response.success) {
      setLastResult(response.data ?? null);
      notify.success(t("resultTitle"), formatMoney(response.data?.calculated_cost));
      router.refresh();
    } else {
      notify.error(tCommon("errorTitle"), response.error || tCommon("unexpectedError"));
    }
  };

  const columns = useMemo<GridColumn<IShippingCost>[]>(
    () => [
      {
        id: "carrier_id",
        accessorFn: (row) => carrierName(row),
        header: t("fields.carrierId"),
        meta: { label: t("fields.carrierId"), hideable: false, exportValue: (row) => carrierName(row) },
        cell: ({ row }) => <span className='font-semibold text-foreground'>{carrierName(row.original)}</span>,
      },
      {
        id: "origin_address",
        accessorFn: (row) => row.origin_address ?? "",
        header: t("fields.originAddress"),
        meta: { label: t("fields.originAddress"), exportValue: (row) => row.origin_address },
      },
      {
        id: "destination_address",
        accessorFn: (row) => row.destination_address ?? "",
        header: t("fields.destinationAddress"),
        meta: { label: t("fields.destinationAddress"), exportValue: (row) => row.destination_address },
      },
      {
        id: "distance",
        accessorFn: (row) => row.distance ?? 0,
        header: t("fields.distance"),
        meta: { label: t("fields.distance"), align: "right", exportValue: (row) => row.distance },
        cell: ({ row }) => formatNumber(row.original.distance, " km"),
      },
      {
        id: "weight",
        accessorFn: (row) => row.weight ?? 0,
        header: t("fields.weight"),
        meta: { label: t("fields.weight"), align: "right", exportValue: (row) => row.weight },
        cell: ({ row }) => formatNumber(row.original.weight, " kg"),
      },
      {
        id: "calculatedCost",
        accessorFn: (row) => row.calculated_cost ?? 0,
        header: t("fields.calculatedCost"),
        meta: { label: t("fields.calculatedCost"), align: "right", exportValue: (row) => row.calculated_cost },
        cell: ({ row }) => (
          <span className='font-semibold tabular-nums text-foreground'>{formatMoney(row.original.calculated_cost)}</span>
        ),
      },
      {
        id: "isEstimated",
        header: t("fields.isEstimated"),
        enableSorting: false,
        meta: {
          label: t("fields.isEstimated"),
          exportValue: (row) => (row.is_estimated ? t("estimated") : t("final")),
        },
        cell: ({ row }) => (
          <Badge variant={row.original.is_estimated ? "outline" : "default"}>
            {row.original.is_estimated ? t("estimated") : t("final")}
          </Badge>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [carrierNames, t],
  );

  const filters: GridFilter<IShippingCost>[] = [
    {
      id: "carrier_id",
      label: t("fields.carrierId"),
      options: carriers
        .filter((carrier) => carrier.id != null)
        .map((carrier) => ({ value: String(carrier.id), label: carrier.name ?? `#${carrier.id}` })),
      accessor: (row) => row.carrier_id,
    },
    {
      id: "isEstimated",
      label: t("fields.isEstimated"),
      options: [
        { value: "true", label: t("estimated") },
        { value: "false", label: t("final") },
      ],
      accessor: (row) => String(Boolean(row.is_estimated)),
    },
  ];

  return (
    <CrudManager<IShippingCost>
      gridId='cotizaciones-envio'
      namespace='Administre.shippingCost'
      icon={HiOutlineCurrencyDollar}
      eyebrow={tCrud("domains.logistics")}
      data={data}
      columns={columns}
      filters={filters}
      stats={[
        { label: t("total"), value: initialData.length, icon: HiOutlineCalculator },
        { label: t("averageCost"), value: formatMoney(average), icon: HiOutlineCurrencyDollar },
        {
          label: t("carriersCount"),
          value: activeCarriers,
          icon: HiOutlineTruck,
          tone: activeCarriers === 0 ? "warning" : "default",
        },
      ]}
      rowLabel={(row) => `#${row.id}`}
      searchPlaceholder={t("searchPlaceholder")}
      searchText={(row) => `${carrierName(row)} ${row.origin_address ?? ""} ${row.destination_address ?? ""}`}
      onDelete={(id) => deleteShippingCostServerAction(id)}>
      <div className='grid gap-4 lg:grid-cols-3'>
        <div className='rounded-xl border border-border/70 bg-background/60 p-5 lg:col-span-2'>
          <h3 className='text-base font-semibold text-foreground'>{t("calculatorTitle")}</h3>
          <p className='mb-4 mt-1 text-sm text-muted-foreground'>{t("calculatorDescription")}</p>
          {activeCarriers === 0 ? (
            <p role='status' className='text-sm text-muted-foreground'>
              {t("noCarriers")}
            </p>
          ) : (
            <FormShippingCost
              initialValues={{ carrier_id: "", origin_address: "", destination_address: "", weight: "", volume: "" }}
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
              <dd className='text-3xl font-semibold text-foreground'>{formatMoney(lastResult.calculated_cost)}</dd>
              <dd className='text-muted-foreground'>
                {carrierName(lastResult)} · {formatNumber(lastResult.distance, " km")}
              </dd>
              {lastResult.calculation_method ? (
                <dd className='text-xs text-muted-foreground'>{lastResult.calculation_method}</dd>
              ) : null}
            </dl>
          ) : (
            <p className='text-sm text-muted-foreground'>{t("resultEmpty")}</p>
          )}
        </div>
      </div>
    </CrudManager>
  );
};
