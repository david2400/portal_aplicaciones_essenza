/** @format */

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import Swal from "sweetalert2";
import { Buttons } from "@repo/ui/buttons/scenes";
import { Badge } from "@repo/ui/badges/scenes/badge";
import {
  HiOutlineCurrencyDollar,
  HiOutlineCalculator,
  HiOutlineTruck,
  HiOutlineTrash,
} from "react-icons/hi2";
import { DataTable } from "@/components/data-table";
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

export const ShippingCostManager = ({ initialData, carriers }: IShippingCostManagerProps) => {
  const router = useRouter();
  const t = useTranslations("Administre.shippingCost");
  const tCommon = useTranslations("Administre.common");
  const validationSchema = validationShippingCost();

  const [lastResult, setLastResult] = useState<IShippingCost | null>(null);

  const carrierNames = useMemo(
    () => new Map(carriers.map((carrier) => [carrier.id ?? -1, carrier.name ?? `#${carrier.id}`])),
    [carriers],
  );

  const data = useMemo(() => [...initialData].sort((a, b) => (b.id ?? 0) - (a.id ?? 0)), [initialData]);

  const metrics = useMemo(() => {
    const costs = initialData.map((item) => item.calculatedCost ?? 0);
    return {
      total: initialData.length,
      average: costs.length ? costs.reduce((acc, value) => acc + value, 0) / costs.length : undefined,
      carriers: carriers.filter((carrier) => carrier.isActive !== false).length,
    };
  }, [initialData, carriers]);

  const showError = (message?: string) =>
    Swal.fire({ title: tCommon("errorTitle"), text: message || tCommon("unexpectedError"), icon: "error" });

  const handleCalculate = async (values: ShippingCostFormValues) => {
    const response = await calculateShippingCostServerAction({
      carrier_id: values.carrierId,
      origin_address: values.originAddress,
      destination_address: values.destinationAddress,
      weight: values.weight,
      volume: values.volume,
    });
    if (response.success) {
      setLastResult(response.data ?? null);
      router.refresh();
    } else {
      showError(response.error);
    }
  };

  const handleDelete = (row: IShippingCost) => {
    if (row.id == null) return;
    const id = row.id;
    Swal.fire({
      title: tCommon("deleteConfirmTitle"),
      text: tCommon("deleteConfirmText", { name: `#${id}` }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: tCommon("deleteConfirmButton"),
      cancelButtonText: tCommon("cancel"),
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      const response = await deleteShippingCostServerAction(id);
      if (response.success) router.refresh();
      else showError(response.error);
    });
  };

  const columns: ColumnDef<IShippingCost>[] = [
    {
      accessorKey: "carrierId",
      header: t("fields.carrierId"),
      cell: ({ row }) => (
        <span className='font-semibold text-foreground'>
          {carrierNames.get(row.original.carrierId ?? -1) ?? "—"}
        </span>
      ),
    },
    { accessorKey: "originAddress", header: t("fields.originAddress") },
    { accessorKey: "destinationAddress", header: t("fields.destinationAddress") },
    {
      accessorKey: "distance",
      header: t("fields.distance"),
      cell: ({ row }) => formatNumber(row.original.distance, " km"),
    },
    {
      accessorKey: "weight",
      header: t("fields.weight"),
      cell: ({ row }) => formatNumber(row.original.weight, " kg"),
    },
    {
      accessorKey: "calculatedCost",
      header: t("fields.calculatedCost"),
      cell: ({ row }) => (
        <span className='font-semibold text-foreground'>{formatMoney(row.original.calculatedCost)}</span>
      ),
    },
    {
      accessorKey: "isEstimated",
      header: t("fields.isEstimated"),
      cell: ({ row }) => (
        <Badge variant={row.original.isEstimated ? "outline" : "default"}>
          {row.original.isEstimated ? t("estimated") : t("final")}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: tCommon("actions"),
      enableSorting: false,
      cell: ({ row }) => (
        <Buttons
          size='sm'
          variant='ghost'
          aria-label={tCommon("deleteAria", { name: `#${row.original.id}` })}
          onClick={() => handleDelete(row.original)}>
          <HiOutlineTrash className='h-4 w-4' aria-hidden='true' />
          {tCommon("delete")}
        </Buttons>
      ),
    },
  ];

  const summaryCards = [
    { icon: HiOutlineCalculator, label: t("total"), value: metrics.total },
    { icon: HiOutlineCurrencyDollar, label: t("averageCost"), value: formatMoney(metrics.average) },
    { icon: HiOutlineTruck, label: t("carriersCount"), value: metrics.carriers },
  ];

  return (
    <section className='flex w-full flex-col gap-6'>
      <div className='flex items-center gap-4'>
        <div className='rounded-2xl bg-primary/10 p-3'>
          <HiOutlineCurrencyDollar className='h-7 w-7 text-primary' aria-hidden='true' />
        </div>
        <div>
          <h2 className='text-xl font-semibold tracking-tight text-foreground'>{t("title")}</h2>
          <p className='mt-1.5 text-base text-muted-foreground'>{t("description")}</p>
        </div>
      </div>

      <div className='grid gap-4 sm:grid-cols-3'>
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

      <div className='grid gap-4 lg:grid-cols-3'>
        <div className='rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2'>
          <h3 className='text-base font-semibold text-foreground'>{t("calculatorTitle")}</h3>
          <p className='mb-4 mt-1 text-sm text-muted-foreground'>{t("calculatorDescription")}</p>
          {metrics.carriers === 0 ? (
            <p role='status' className='text-sm text-muted-foreground'>
              {t("noCarriers")}
            </p>
          ) : (
            <FormShippingCost
              initialValues={{ carrierId: "", originAddress: "", destinationAddress: "", weight: "", volume: "" }}
              validationSchema={validationSchema}
              onSubmit={handleCalculate}
              carriers={carriers}
            />
          )}
        </div>

        <div
          aria-live='polite'
          className='flex flex-col justify-center rounded-2xl border border-primary/30 bg-primary/5 p-5 shadow-sm'>
          {lastResult ? (
            <dl className='space-y-2 text-sm'>
              <dt className='text-muted-foreground'>{t("resultTitle")}</dt>
              <dd className='text-3xl font-semibold text-foreground'>{formatMoney(lastResult.calculatedCost)}</dd>
              <dd className='text-muted-foreground'>
                {carrierNames.get(lastResult.carrierId ?? -1) ?? "—"} ·{" "}
                {formatNumber(lastResult.distance, " km")}
              </dd>
              {lastResult.calculationMethod ? (
                <dd className='text-xs text-muted-foreground'>{lastResult.calculationMethod}</dd>
              ) : null}
            </dl>
          ) : (
            <p className='text-sm text-muted-foreground'>{t("resultEmpty")}</p>
          )}
        </div>
      </div>

      <DataTable
        data={data}
        columns={columns}
        className='py-2'
        emptyTitle={t("emptyTitle")}
        emptyDescription={t("emptyDescription")}
      />
    </section>
  );
};
