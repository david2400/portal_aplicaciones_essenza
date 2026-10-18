/** @format */

"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Badge } from "@repo/ui/badges/scenes/badge";
import { Buttons } from "@repo/ui/buttons/scenes/index";
import {
  HiOutlineBuildingStorefront,
  HiOutlineCreditCard,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineGlobeAlt,
  HiOutlineLink,
  HiOutlinePencilSquare,
  HiOutlinePlusCircle,
} from "react-icons/hi2";
import { Link } from "@/shared/i18n/routing";
import { CrudManager } from "@/components/crud-manager";
import type { GridColumn, GridFilter } from "@/components/data-grid";
import { notify } from "@/components/notifications";
import { formatMoney, formatNumber } from "@/lib/format";
import { PAYMENT_METHODS_HREF } from "./form";
import { CHANNEL_ICONS, KIND_ICONS } from "../scenes/formPaymentMethod";
import {
  PAYMENT_CHANNELS,
  PAYMENT_KINDS,
  isGatewayProvider,
  isPaymentChannel,
  isPaymentKind,
  type IGatewayProvider,
  type IPaymentMethod,
} from "../models/paymentMethod.interface";
import {
  deletePaymentMethodServerAction,
  updatePaymentMethodServerAction,
} from "@/app/[locale]/ventas/payment-methods/actions";

interface IPaymentMethodManagerProps {
  initialData: IPaymentMethod[];
  providers: IGatewayProvider[];
}

/** Medios de pago físicos y virtuales: tipo, pasarela, comisión, estado y uso. */
export const PaymentMethodManager = ({ initialData, providers }: IPaymentMethodManagerProps) => {
  const router = useRouter();
  const t = useTranslations("Administre.paymentMethod");
  const tCrud = useTranslations("Crud");
  const tCommon = useTranslations("Administre.common");
  const editHref = (row: IPaymentMethod) => `${PAYMENT_METHODS_HREF}/${row.id}`;

  const kindLabel = (row: IPaymentMethod) => (isPaymentKind(row.kind) ? t(`kinds.${row.kind}`) : (row.kind ?? "—"));
  const channelLabel = (row: IPaymentMethod) => (isPaymentChannel(row.channel) ? t(`channels.${row.channel}`) : (row.channel ?? "—"));
  const feeLabel = (row: IPaymentMethod) => {
    const percent = row.fee_percent ?? 0;
    const fixed = row.fee_fixed ?? 0;
    if (!percent && !fixed) return "—";
    return [percent ? `${percent}%` : null, fixed ? formatMoney(fixed) : null].filter(Boolean).join(" + ");
  };

  const toggleActive = async (row: IPaymentMethod) => {
    if (row.id == null || !row.name || !row.channel || !row.kind) return;
    const result = await updatePaymentMethodServerAction(row.id, {
      name: row.name,
      code: row.code,
      description: row.description,
      instructions: row.instructions,
      channel: row.channel,
      kind: row.kind,
      provider: row.provider,
      active: !row.active,
      position: row.position,
      fee_percent: row.fee_percent,
      fee_fixed: row.fee_fixed,
      min_amount: row.min_amount,
      max_amount: row.max_amount,
      requires_reference: row.requires_reference,
      allows_change: row.allows_change,
    });
    if (result.success) {
      notify.success(row.active ? t("deactivated") : t("activated"), row.name);
      router.refresh();
    } else {
      notify.error(tCommon("errorTitle"), result.error || tCommon("unexpectedError"));
    }
  };

  const columns = useMemo<GridColumn<IPaymentMethod>[]>(
    () => [
      {
        id: "name",
        accessorFn: (row) => row.name ?? "",
        header: t("fields.name"),
        meta: { label: t("fields.name"), hideable: false, exportValue: (row) => row.name },
        cell: ({ row }) => {
          const Icon = isPaymentKind(row.original.kind) ? KIND_ICONS[row.original.kind] : HiOutlineCreditCard;
          return (
            <div className='flex min-w-0 items-center gap-3'>
              <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                <Icon className='h-5 w-5' aria-hidden='true' />
              </span>
              <div className='min-w-0'>
                <Link href={editHref(row.original)} className='font-semibold text-foreground underline-offset-4 hover:underline'>
                  {row.original.name ?? "—"}
                </Link>
                <p className='font-mono text-xs text-muted-foreground'>{row.original.code}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: "channel",
        header: t("fields.channel"),
        enableSorting: false,
        meta: { label: t("fields.channel"), exportValue: (row) => channelLabel(row) },
        cell: ({ row }) => {
          const Icon = isPaymentChannel(row.original.channel) ? CHANNEL_ICONS[row.original.channel] : HiOutlineGlobeAlt;
          return (
            <span className='inline-flex items-center gap-1.5 text-sm'>
              <Icon className='h-4 w-4 text-muted-foreground' aria-hidden='true' />
              {channelLabel(row.original)}
            </span>
          );
        },
      },
      {
        id: "kind",
        header: t("fields.kind"),
        enableSorting: false,
        meta: { label: t("fields.kind"), exportValue: (row) => kindLabel(row) },
        cell: ({ row }) => (
          <div className='flex flex-wrap items-center gap-1.5'>
            <Badge variant='outline'>{kindLabel(row.original)}</Badge>
            {isGatewayProvider(row.original.provider) ? (
              <Badge variant={row.original.provider_configured ? "secondary" : "destructive"} title={row.original.provider_configured ? undefined : t("providerMissing")}>
                {t(`providers.${row.original.provider}`)}
              </Badge>
            ) : null}
          </div>
        ),
      },
      {
        id: "fee",
        header: t("fields.fee"),
        enableSorting: false,
        meta: { label: t("fields.fee"), align: "right", exportValue: (row) => feeLabel(row) },
        cell: ({ row }) => <span className='tabular-nums'>{feeLabel(row.original)}</span>,
      },
      {
        id: "payments",
        header: t("fields.paymentsCount"),
        enableSorting: false,
        meta: { label: t("fields.paymentsCount"), align: "right", exportValue: (row) => row.payments_count ?? 0 },
        cell: ({ row }) => <span className='tabular-nums'>{formatNumber(row.original.payments_count ?? 0)}</span>,
      },
      {
        id: "active",
        header: t("fields.active"),
        enableSorting: false,
        meta: { label: t("fields.active"), exportValue: (row) => (row.active ? t("active") : t("inactive")) },
        cell: ({ row }) =>
          row.original.active ? <Badge variant='secondary'>{t("active")}</Badge> : <Badge variant='outline'>{t("inactive")}</Badge>,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t],
  );

  const filters: GridFilter<IPaymentMethod>[] = [
    {
      id: "channel",
      label: t("fields.channel"),
      options: PAYMENT_CHANNELS.map((value) => ({ value, label: t(`channels.${value}`) })),
      accessor: (row) => row.channel,
    },
    {
      id: "kind",
      label: t("fields.kind"),
      options: PAYMENT_KINDS.map((value) => ({ value, label: t(`kinds.${value}`) })),
      accessor: (row) => row.kind,
    },
    {
      id: "active",
      label: t("fields.active"),
      options: [
        { value: "true", label: t("active") },
        { value: "false", label: t("inactive") },
      ],
      accessor: (row) => String(Boolean(row.active)),
    },
  ];

  const active = initialData.filter((item) => item.active);
  const unconfigured = providers.filter((provider) => !provider.configured).length;
  const stats = [
    { label: t("total"), value: initialData.length, icon: HiOutlineCreditCard, hint: t("activeCount", { count: active.length }) },
    {
      label: t("physical"),
      value: active.filter((item) => item.channel === "PHYSICAL").length,
      icon: HiOutlineBuildingStorefront,
      hint: t("physicalHint"),
    },
    {
      label: t("virtual"),
      value: active.filter((item) => item.channel === "VIRTUAL").length,
      icon: HiOutlineGlobeAlt,
      hint: t("virtualHint"),
    },
    {
      label: t("gateways"),
      value: `${providers.length - unconfigured}/${providers.length}`,
      icon: HiOutlineLink,
      hint: unconfigured > 0 ? t("gatewaysPending", { count: unconfigured }) : t("gatewaysReady"),
      tone: unconfigured > 0 ? ("warning" as const) : ("success" as const),
    },
  ];

  return (
    <CrudManager<IPaymentMethod>
      gridId='medios-pago'
      namespace='Administre.paymentMethod'
      icon={HiOutlineCreditCard}
      eyebrow={tCrud("domains.sales")}
      data={initialData}
      columns={columns}
      filters={filters}
      stats={stats}
      rowLabel={(row) => row.name ?? `#${row.id}`}
      searchPlaceholder={t("searchPlaceholder")}
      searchText={(row) => `${row.name ?? ""} ${row.code ?? ""} ${row.description ?? ""}`}
      headerActions={
        <Buttons onClick={() => router.push(`${PAYMENT_METHODS_HREF}/new`)} className='rounded-full'>
          <HiOutlinePlusCircle className='h-4 w-4' aria-hidden='true' />
          {t("create")}
        </Buttons>
      }
      extraRowActions={(row) => [
        { label: tCommon("edit"), icon: HiOutlinePencilSquare, onSelect: () => router.push(editHref(row)) },
        {
          label: row.active ? t("deactivate") : t("activate"),
          icon: row.active ? HiOutlineEyeSlash : HiOutlineEye,
          onSelect: () => toggleActive(row),
        },
      ]}
      onDelete={(id) => deletePaymentMethodServerAction(id)}
    />
  );
};
