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
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineTruck,
  HiOutlineTrash,
} from "react-icons/hi2";
import { DataTable } from "@/components/data-table";
import { FormDeliveryEstimate } from "../scenes/formDeliveryEstimate";
import {
  validationDeliveryEstimate,
  type DeliveryEstimateFormValues,
} from "../schemas/deliveryEstimate.schema";
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

export const DeliveryEstimateManager = ({ initialData, carriers }: IDeliveryEstimateManagerProps) => {
  const router = useRouter();
  const t = useTranslations("Administre.deliveryEstimate");
  const tCommon = useTranslations("Administre.common");
  const validationSchema = validationDeliveryEstimate();

  const [lastResult, setLastResult] = useState<IDeliveryEstimate | null>(null);

  const carrierNames = useMemo(
    () => new Map(carriers.map((carrier) => [carrier.id ?? -1, carrier.name ?? `#${carrier.id}`])),
    [carriers],
  );

  const data = useMemo(() => [...initialData].sort((a, b) => (b.id ?? 0) - (a.id ?? 0)), [initialData]);

  const metrics = useMemo(() => {
    const days = initialData.map((item) => item.estimatedDays).filter((value): value is number => value != null);
    return {
      total: initialData.length,
      averageDays: days.length ? (days.reduce((acc, value) => acc + value, 0) / days.length).toFixed(1) : "—",
      carriers: carriers.filter((carrier) => carrier.isActive !== false).length,
    };
  }, [initialData, carriers]);

  const showError = (message?: string) =>
    Swal.fire({ title: tCommon("errorTitle"), text: message || tCommon("unexpectedError"), icon: "error" });

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
      router.refresh();
    } else {
      showError(response.error);
    }
  };

  const handleDelete = (row: IDeliveryEstimate) => {
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
      const response = await deleteDeliveryEstimateServerAction(id);
      if (response.success) router.refresh();
      else showError(response.error);
    });
  };

  const columns: ColumnDef<IDeliveryEstimate>[] = [
    {
      accessorKey: "carrierId",
      header: t("fields.carrierId"),
      cell: ({ row }) => (
        <span className='font-semibold text-foreground'>
          {carrierNames.get(row.original.carrierId ?? -1) ?? "—"}
        </span>
      ),
    },
    {
      id: "route",
      header: t("fields.route"),
      cell: ({ row }) => `${row.original.originAddress ?? "—"} → ${row.original.destinationAddress ?? "—"}`,
    },
    {
      accessorKey: "shipmentDate",
      header: t("fields.shipmentDate"),
      cell: ({ row }) => formatDate(row.original.shipmentDate),
    },
    {
      accessorKey: "estimatedDeliveryDate",
      header: t("fields.estimatedDeliveryDate"),
      cell: ({ row }) => (
        <span className='font-semibold text-foreground'>{formatDate(row.original.estimatedDeliveryDate)}</span>
      ),
    },
    {
      id: "window",
      header: t("fields.window"),
      cell: ({ row }) =>
        `${formatDate(row.original.minDeliveryDate)} – ${formatDate(row.original.maxDeliveryDate)}`,
    },
    {
      accessorKey: "estimatedDays",
      header: t("fields.estimatedDays"),
      cell: ({ row }) => row.original.estimatedDays ?? "—",
    },
    {
      accessorKey: "isBusinessDaysOnly",
      header: t("fields.isBusinessDaysOnly"),
      cell: ({ row }) => (
        <Badge variant={row.original.isBusinessDaysOnly ? "default" : "outline"}>
          {row.original.isBusinessDaysOnly ? tCommon("yes") : tCommon("no")}
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
    { icon: HiOutlineCalendarDays, label: t("total"), value: metrics.total },
    { icon: HiOutlineClock, label: t("averageDays"), value: metrics.averageDays },
    { icon: HiOutlineTruck, label: t("carriersCount"), value: metrics.carriers },
  ];

  return (
    <section className='flex w-full flex-col gap-6'>
      <div className='flex items-center gap-4'>
        <div className='rounded-2xl bg-primary/10 p-3'>
          <HiOutlineCalendarDays className='h-7 w-7 text-primary' aria-hidden='true' />
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
          className='flex flex-col justify-center rounded-2xl border border-primary/30 bg-primary/5 p-5 shadow-sm'>
          {lastResult ? (
            <dl className='space-y-2 text-sm'>
              <dt className='text-muted-foreground'>{t("resultTitle")}</dt>
              <dd className='text-3xl font-semibold text-foreground'>
                {formatDate(lastResult.estimatedDeliveryDate)}
              </dd>
              <dd className='text-muted-foreground'>
                {t("resultWindow", {
                  min: formatDate(lastResult.minDeliveryDate),
                  max: formatDate(lastResult.maxDeliveryDate),
                })}
              </dd>
              <dd className='text-muted-foreground'>
                {t("resultDays", { days: lastResult.estimatedDays ?? "—" })}
              </dd>
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
