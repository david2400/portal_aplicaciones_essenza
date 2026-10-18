/** @format */

"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { IconType } from "react-icons";
import {
  HiOutlineArchiveBox,
  HiOutlineArrowDownTray,
  HiOutlineArrowLeft,
  HiOutlineArrowUpTray,
  HiOutlineBanknotes,
  HiOutlineBuildingStorefront,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineCog6Tooth,
  HiOutlineComputerDesktop,
  HiOutlineCube,
  HiOutlineEnvelope,
  HiOutlineExclamationTriangle,
  HiOutlineMapPin,
  HiOutlinePauseCircle,
  HiOutlinePencilSquare,
  HiOutlinePhone,
  HiOutlineStar,
  HiOutlineUserCircle,
} from "react-icons/hi2";
import { Badge } from "@repo/ui/badges/scenes/badge";
import { Buttons } from "@repo/ui/buttons/scenes";
import { PageHeader } from "@/components/page-header";
import { KpiStrip } from "@/components/form-sections";
import { formatApiDate, formatMoney, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Link } from "@/shared/i18n/routing";
import type { PageResult } from "@/shared/models/pagination";
import {
  MAIN_TYPES,
  WAREHOUSES_HREF,
  type IWarehouse,
  type IWarehouseLinks,
  type IWarehouseLocation,
  type IWarehouseMovement,
  type IWarehouseStock,
  type WarehouseType,
} from "../models/warehouse.interface";
import { useWarehouseActions } from "../hooks/useWarehouseActions";
import { WarehouseTypeBadge } from "./warehouse-type-badge";
import { WarehouseStock } from "./warehouse-stock";
import { WarehouseLocations } from "./warehouse-locations";

const Card = ({ icon: Icon, title, children, className }: { icon: IconType; title: string; children: ReactNode; className?: string }) => (
  <section className={cn("grid content-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm", className)}>
    <h3 className='flex items-center gap-2 text-sm font-semibold'>
      <Icon className='h-4 w-4 text-muted-foreground' aria-hidden='true' />
      {title}
    </h3>
    {children}
  </section>
);

const Flag = ({ on, label }: { on: boolean; label: string }) => (
  <li className='flex items-center justify-between gap-2 text-sm'>
    <span>{label}</span>
    <span className={cn("rounded-full px-2 py-0.5 text-xs", on ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-muted text-muted-foreground")}>
      {on ? "✓" : "—"}
    </span>
  </li>
);

/** Ficha de la bodega: estado, indicadores, operación, responsable, capacidad, existencias, ubicaciones, movimientos y tiendas. */
export const WarehouseDetail = ({
  warehouse,
  stock,
  stockQuery,
  movements,
  links,
  locations,
}: {
  warehouse: IWarehouse;
  stock: PageResult<IWarehouseStock>;
  stockQuery: { q: string; belowMin: boolean };
  movements: IWarehouseMovement[];
  links: IWarehouseLinks;
  locations: IWarehouseLocation[];
}) => {
  const t = useTranslations("Administre.warehouse");
  const td = useTranslations("Administre.warehouse.detail");
  const tActions = useTranslations("Administre.warehouse.actions");
  const tMoves = useTranslations("Administre.warehouse.movements");
  const tCommon = useTranslations("Administre.common");
  const tCrud = useTranslations("Crud");
  const { setActive, setMain, busy } = useWarehouseActions();
  const working = busy === warehouse.id;
  const occupancy = warehouse.occupancy_percent;
  const stores = links.stores ?? [];
  const registers = links.registers ?? [];
  const canBeMain = !warehouse.is_main && warehouse.active !== false && MAIN_TYPES.includes(warehouse.warehouse_type as WarehouseType);

  return (
    <section className='flex w-full flex-col gap-6'>
      <Link href={WAREHOUSES_HREF} className='inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground'>
        <HiOutlineArrowLeft className='h-4 w-4' aria-hidden='true' />
        {td("back")}
      </Link>

      <PageHeader
        title={warehouse.name ?? `#${warehouse.id}`}
        description={[warehouse.code, warehouse.city].filter(Boolean).join(" · ")}
        icon={HiOutlineArchiveBox}
        eyebrow={tCrud("domains.inventory")}
        actions={
          <>
            <WarehouseTypeBadge type={warehouse.warehouse_type} />
            {warehouse.is_main ? <Badge variant='secondary'>{t("main")}</Badge> : null}
            {warehouse.active === false ? <Badge variant='outline'>{tCommon("inactive")}</Badge> : null}
            {canBeMain ? (
              <Buttons type='button' variant='outline' className='rounded-full' loading={working} onClick={() => setMain(warehouse)}>
                <HiOutlineStar className='h-4 w-4' aria-hidden='true' />
                {tActions("makeMain")}
              </Buttons>
            ) : null}
            {!warehouse.is_main ? (
              warehouse.active === false ? (
                <Buttons type='button' variant='outline' className='rounded-full' loading={working} onClick={() => setActive(warehouse, true)}>
                  <HiOutlineCheckCircle className='h-4 w-4' aria-hidden='true' />
                  {tActions("activate")}
                </Buttons>
              ) : (
                <Buttons type='button' variant='ghost' className='rounded-full' loading={working} onClick={() => setActive(warehouse, false)}>
                  <HiOutlinePauseCircle className='h-4 w-4' aria-hidden='true' />
                  {tActions("deactivate")}
                </Buttons>
              )
            ) : null}
            <Link href={`${WAREHOUSES_HREF}/${warehouse.id}/edit`}
              className='inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90'>
              <HiOutlinePencilSquare className='h-4 w-4' aria-hidden='true' />
              {td("edit")}
            </Link>
          </>
        }
      />

      <KpiStrip
        items={[
          {
            label: td("units"),
            value: formatNumber(warehouse.units_on_hand ?? 0),
            hint: td("unitsHint", {
              available: formatNumber(warehouse.units_available ?? 0),
              reserved: formatNumber(warehouse.units_reserved ?? 0),
            }),
            icon: HiOutlineCube,
          },
          {
            label: t("fields.stockValue"),
            value: formatMoney(warehouse.stock_value ?? 0),
            hint: td("skus", { count: formatNumber(warehouse.sku_count ?? 0) }),
            icon: HiOutlineBanknotes,
          },
          {
            label: t("fields.belowMin"),
            value: formatNumber(warehouse.below_min_count ?? 0),
            tone: (warehouse.below_min_count ?? 0) > 0 ? "warn" : "good",
            icon: HiOutlineExclamationTriangle,
          },
          {
            label: t("occupancy"),
            value: occupancy != null ? `${formatNumber(occupancy)} %` : "—",
            hint: warehouse.capacity_units != null ? td("capacityOf", { units: formatNumber(warehouse.capacity_units) }) : td("noCapacity"),
            tone: occupancy == null ? undefined : occupancy > 90 ? "bad" : occupancy > 75 ? "warn" : "good",
            icon: HiOutlineArchiveBox,
          },
        ]}
      />

      <div className='grid gap-4 lg:grid-cols-3'>
        <Card icon={HiOutlineCog6Tooth} title={td("operation")}>
          <ul className='grid gap-2'>
            <Flag on={Boolean(warehouse.allow_sales)} label={t("fields.allowSales")} />
            <Flag on={Boolean(warehouse.allow_online)} label={t("fields.allowOnline")} />
            <Flag on={Boolean(warehouse.allow_receiving)} label={t("fields.allowReceiving")} />
          </ul>
          <p className='text-xs text-muted-foreground'>{td("priority", { priority: warehouse.fulfillment_priority ?? 10 })}</p>
        </Card>

        <Card icon={HiOutlineUserCircle} title={td("manager")}>
          <ul className='grid gap-2 text-sm'>
            <li className='flex items-start gap-2'>
              <HiOutlineUserCircle className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground' aria-hidden='true' />
              {warehouse.manager_name ?? <span className='text-muted-foreground'>{td("noManager")}</span>}
            </li>
            {warehouse.manager_phone ? (
              <li className='flex items-center gap-2'>
                <HiOutlinePhone className='h-4 w-4 shrink-0 text-muted-foreground' aria-hidden='true' />
                <a href={`tel:${warehouse.manager_phone}`} className='hover:underline'>{warehouse.manager_phone}</a>
              </li>
            ) : null}
            {warehouse.manager_email ? (
              <li className='flex items-center gap-2'>
                <HiOutlineEnvelope className='h-4 w-4 shrink-0 text-muted-foreground' aria-hidden='true' />
                <a href={`mailto:${warehouse.manager_email}`} className='truncate text-primary hover:underline'>{warehouse.manager_email}</a>
              </li>
            ) : null}
            {warehouse.opening_hours ? (
              <li className='flex items-start gap-2'>
                <HiOutlineClock className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground' aria-hidden='true' />
                {warehouse.opening_hours}
              </li>
            ) : null}
            <li className='flex items-start gap-2'>
              <HiOutlineMapPin className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground' aria-hidden='true' />
              {[warehouse.address, warehouse.city].filter(Boolean).join(", ") || <span className='text-muted-foreground'>{tCrud("noLocation")}</span>}
            </li>
          </ul>
          {warehouse.notes ? <p className='whitespace-pre-line rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground'>{warehouse.notes}</p> : null}
        </Card>

        <Card icon={HiOutlineBuildingStorefront} title={td("links")}>
          {stores.length === 0 && registers.length === 0 ? (
            <p className='text-sm text-muted-foreground'>{td("noLinks")}</p>
          ) : (
            <ul className='grid gap-1.5 text-sm'>
              {stores.map((store) => (
                <li key={`s-${store.id}`} className='flex items-center justify-between gap-2'>
                  <Link href={`/ventas/stores/${store.id}`} className='inline-flex min-w-0 items-center gap-2 hover:underline'>
                    <HiOutlineBuildingStorefront className='h-4 w-4 shrink-0 text-muted-foreground' aria-hidden='true' />
                    <span className='truncate'>{store.name}</span>
                  </Link>
                  {!store.active ? <Badge variant='outline'>{tCommon("inactive")}</Badge> : null}
                </li>
              ))}
              {registers.map((register) => (
                <li key={`r-${register.id}`} className='flex items-center justify-between gap-2 pl-6'>
                  <Link href={`/ventas/cash-registers/${register.id}`} className='inline-flex min-w-0 items-center gap-2 text-muted-foreground hover:underline'>
                    <HiOutlineComputerDesktop className='h-4 w-4 shrink-0' aria-hidden='true' />
                    <span className='truncate'>{register.name}</span>
                  </Link>
                  <span className='shrink-0 text-xs text-muted-foreground'>{register.own ? td("ownWarehouse") : register.store_name}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <WarehouseStock warehouse={warehouse} stock={stock} query={stockQuery} />

      <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]'>
        <section aria-labelledby='warehouse-moves' className='grid content-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm'>
          <div className='flex items-center justify-between gap-2'>
            <h3 id='warehouse-moves' className='text-sm font-semibold'>{tMoves("title")}</h3>
            <Link href='/inventory/inventory-movements' className='text-xs font-medium text-primary hover:underline'>{tMoves("all")}</Link>
          </div>
          {movements.length === 0 ? (
            <p className='text-sm text-muted-foreground'>{tMoves("empty")}</p>
          ) : (
            <ul className='divide-y divide-border'>
              {movements.map((move) => {
                const incoming = move.direction === "IN";
                return (
                  <li key={move.id} className='flex items-center gap-3 py-2 text-sm'>
                    <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      incoming ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-rose-500/10 text-rose-700 dark:text-rose-400")}>
                      {incoming ? <HiOutlineArrowDownTray className='h-4 w-4' aria-hidden='true' /> : <HiOutlineArrowUpTray className='h-4 w-4' aria-hidden='true' />}
                    </span>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate font-medium'>{move.product_name ?? move.sku_code ?? "—"}</p>
                      <p className='truncate text-xs text-muted-foreground'>
                        {[
                          tMoves(`types.${move.type}` as never),
                          move.other_warehouse ? (incoming ? tMoves("from", { name: move.other_warehouse }) : tMoves("to", { name: move.other_warehouse })) : null,
                          move.reference_type ? tMoves("reference", { type: move.reference_type, id: move.reference_id ?? "" }) : null,
                          move.reason,
                        ].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <div className='shrink-0 text-right'>
                      <p className={cn("font-semibold tabular-nums", incoming ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400")}>
                        {incoming ? "+" : "−"}
                        {formatNumber(move.quantity ?? 0)}
                      </p>
                      <p className='text-xs text-muted-foreground'>{formatApiDate(move.created_at)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <WarehouseLocations warehouse={warehouse} locations={locations} />
      </div>
    </section>
  );
};
