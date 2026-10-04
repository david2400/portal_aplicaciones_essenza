/** @format */

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import classNames from "classnames";
import { Link } from "@/shared/i18n/routing";
import { EmptyState } from "@/components/feedback/empty-state";
import { TrendChart } from "./trend-chart";
import { DASHBOARD_RANGES, type IDashboardData } from "../models/dashboard.interface";

const money = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const integer = new Intl.NumberFormat("es-CO");
const formatMoney = (value?: number | null) => (value == null ? "—" : money.format(value));
const formatInt = (value?: number | null) => (value == null ? "—" : integer.format(value));
const formatPercent = (value?: number | null) => (value == null ? "—" : `${value.toFixed(1)}%`);

/** Variación con signo y texto; el color nunca va solo (lleva ▲/▼ y la cifra). */
const Delta = ({ value, label }: { value?: number | null; label: string }) => {
  if (value == null) return null;
  const up = value >= 0;
  return (
    <p className={classNames("mt-1 text-xs font-medium", up ? "text-success" : "text-destructive")}>
      <span aria-hidden='true'>{up ? "▲" : "▼"}</span> {up ? "+" : ""}
      {value.toFixed(1)}% <span className='text-muted-foreground'>{label}</span>
    </p>
  );
};

const Panel = ({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) => (
  <section className='rounded-2xl border border-border bg-card p-6 shadow-sm'>
    <div className='mb-4 flex items-center justify-between gap-2'>
      <h2 className='text-base font-semibold text-foreground'>{title}</h2>
      {action}
    </div>
    {children}
  </section>
);

export const Dashboard = ({ data }: { data: IDashboardData }) => {
  const t = useTranslations("Dashboard");
  const { report, kpis, trends, funnel, pendingOrders, lowStock, rangeDays } = data;

  const tiles = [
    { label: t("revenue"), value: formatMoney(report?.totalRevenue), delta: kpis?.revenueGrowth },
    { label: t("orders"), value: formatInt(report?.totalOrders), delta: kpis?.orderGrowth },
    { label: t("averageOrderValue"), value: formatMoney(report?.averageOrderValue), delta: kpis?.averageOrderValueGrowth },
    { label: t("customers"), value: formatInt(report?.totalCustomers), delta: kpis?.customerGrowth },
    { label: t("conversionRate"), value: formatPercent(report?.conversionRate), delta: kpis?.conversionRateImprovement },
    { label: t("refundRate"), value: formatPercent(report?.refundRate), delta: null },
  ];

  const funnelSteps = funnel
    ? [
        { label: t("funnel.visitors"), value: funnel.visitors },
        { label: t("funnel.productViews"), value: funnel.productViews },
        { label: t("funnel.addToCart"), value: funnel.addToCart },
        { label: t("funnel.checkout"), value: funnel.checkout },
        { label: t("funnel.purchase"), value: funnel.purchase },
      ]
    : [];
  const funnelMax = Math.max(...funnelSteps.map((step) => step.value ?? 0), 1);
  const analyticsUnavailable = !report && !kpis && !trends && !funnel;

  return (
    <section className='mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8'>
      <header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div className='space-y-1'>
          <p className='text-xs font-semibold uppercase tracking-[0.28em] text-primary'>{t("eyebrow")}</p>
          <h1 className='text-2xl font-semibold tracking-tight text-foreground sm:text-3xl'>{t("title")}</h1>
          <p className='max-w-3xl text-sm text-muted-foreground'>{t("description", { days: rangeDays })}</p>
        </div>
        <nav aria-label={t("rangeLabel")} className='flex gap-2'>
          {DASHBOARD_RANGES.map((days) => (
            <Link
              key={days}
              href={`/?range=${days}`}
              aria-current={days === rangeDays ? "true" : undefined}
              className={classNames(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                days === rangeDays
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}>
              {t("rangeOption", { days })}
            </Link>
          ))}
        </nav>
      </header>

      {analyticsUnavailable ? (
        <div role='status' className='rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm text-foreground'>
          {t("analyticsUnavailable")}
        </div>
      ) : null}

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {tiles.map((tile) => (
          <div key={tile.label} className='rounded-2xl border border-border bg-card p-6 shadow-sm'>
            <p className='text-sm font-semibold text-muted-foreground'>{tile.label}</p>
            <p className='mt-2 text-3xl font-semibold tracking-tight text-foreground'>{tile.value}</p>
            <Delta value={tile.delta} label={t("vsPrevious")} />
          </div>
        ))}
      </div>

      <div className='grid gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <Panel title={t("trendsTitle")}>
            {trends && trends.length > 0 ? (
              <TrendChart data={trends} />
            ) : (
              <EmptyState title={t("noData")} description={t("noDataDescription")} />
            )}
          </Panel>
        </div>

        <Panel title={t("funnelTitle")}>
          {funnelSteps.length > 0 ? (
            <ol className='space-y-3'>
              {funnelSteps.map((step) => (
                <li key={step.label}>
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>{step.label}</span>
                    <span className='font-semibold text-foreground'>{formatInt(step.value)}</span>
                  </div>
                  <div className='mt-1 h-2 rounded-full bg-muted'>
                    <div
                      className='h-2 rounded-full bg-primary'
                      style={{ width: `${((step.value ?? 0) / funnelMax) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
              <li className='pt-2 text-sm text-muted-foreground'>
                {t("funnel.overall")}:{" "}
                <span className='font-semibold text-foreground'>{formatPercent(funnel?.overallConversionRate)}</span>
              </li>
            </ol>
          ) : (
            <EmptyState title={t("noData")} description={t("noDataDescription")} />
          )}
        </Panel>
      </div>

      <div className='grid gap-6 lg:grid-cols-2'>
        <Panel
          title={t("pendingOrdersTitle")}
          action={
            <Link href='/ventas/orders' className='text-sm font-medium text-primary hover:underline'>
              {t("viewOrders")}
            </Link>
          }>
          <p className='text-4xl font-semibold tracking-tight text-foreground'>{formatInt(pendingOrders)}</p>
          <p className='mt-1 text-sm text-muted-foreground'>{t("pendingOrdersHint")}</p>
        </Panel>

        <Panel
          title={t("lowStockTitle")}
          action={
            <Link href='/inventory/inventory-movements' className='text-sm font-medium text-primary hover:underline'>
              {t("registerEntry")}
            </Link>
          }>
          {lowStock && lowStock.length > 0 ? (
            <ul className='divide-y divide-border'>
              {lowStock.map((product) => (
                <li key={product.id} className='flex items-center justify-between py-2 text-sm'>
                  <span className='text-foreground'>{product.name}</span>
                  <span className='font-semibold text-destructive'>{t("units", { count: product.stock ?? 0 })}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className='text-sm text-muted-foreground'>{lowStock ? t("lowStockEmpty") : t("noData")}</p>
          )}
        </Panel>
      </div>
    </section>
  );
};
