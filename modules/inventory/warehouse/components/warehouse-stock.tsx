/** @format */

"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Buttons } from "@repo/ui/buttons/scenes";
import { HiOutlineCheck, HiOutlineCube, HiOutlineExclamationTriangle, HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { EmptyBlock, Segmented } from "@/components/form-sections";
import { notify } from "@/components/notifications";
import { formatMoney, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PageResult } from "@/shared/models/pagination";
import type { IWarehouse, IWarehouseStock } from "../models/warehouse.interface";
import { updateMinThresholdServerAction } from "@/app/[locale]/inventory/warehouses/actions";

const inputClass =
  "h-9 rounded-lg border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Mínimo editable en línea: guarda al confirmar (Enter o botón) y solo si cambió. */
const MinCell = ({ warehouseId, row }: { warehouseId: number; row: IWarehouseStock }) => {
  const t = useTranslations("Administre.warehouse.stock");
  const tCommon = useTranslations("Administre.common");
  const router = useRouter();
  const [value, setValue] = useState(String(row.min_threshold ?? 0));
  const [saving, setSaving] = useState(false);
  useEffect(() => setValue(String(row.min_threshold ?? 0)), [row.min_threshold]);
  const dirty = value !== String(row.min_threshold ?? 0);
  const valid = /^\d{1,7}$/.test(value);

  const save = async () => {
    if (!dirty || !valid || row.sku_id == null) return;
    setSaving(true);
    const result = await updateMinThresholdServerAction(warehouseId, row.sku_id, Number(value));
    setSaving(false);
    if (!result.success) {
      notify.error(tCommon("errorTitle"), result.error);
      return;
    }
    notify.success(t("minSaved"), row.sku_code ?? undefined);
    router.refresh();
  };

  return (
    <form className='flex items-center justify-end gap-1' onSubmit={(event) => { event.preventDefault(); void save(); }}>
      <input aria-label={t("minFor", { sku: row.sku_code ?? "" })} inputMode='numeric' value={value}
        aria-invalid={!valid} onChange={(event) => setValue(event.target.value.replace(/[^\d]/g, ""))}
        className={cn(inputClass, "w-20 text-right tabular-nums", !valid && "border-destructive")} />
      <Buttons type='submit' size='icon' variant='ghost' disabled={!dirty || !valid} loading={saving} aria-label={t("saveMin")}
        className={cn(!dirty && "invisible")}>
        <HiOutlineCheck className='h-4 w-4' aria-hidden='true' />
      </Buttons>
    </form>
  );
};

/** Existencias por SKU de la bodega (paginadas en el servidor por la URL), valorizadas, con mínimos editables. */
export const WarehouseStock = ({
  warehouse,
  stock,
  query,
}: {
  warehouse: IWarehouse;
  stock: PageResult<IWarehouseStock>;
  query: { q: string; belowMin: boolean };
}) => {
  const t = useTranslations("Administre.warehouse.stock");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(query.q);

  const navigate = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value == null || value === "") next.delete(key);
      else next.set(key, value);
    }
    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  };

  // Búsqueda con espera corta para no pedir una página por tecla.
  useEffect(() => {
    if (search === query.q) return;
    const timer = setTimeout(() => navigate({ q: search.trim() || null, page: null }), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const pageNumber = stock.page + 1;
  const empty = stock.items.length === 0;

  return (
    <section aria-labelledby='warehouse-stock' className='grid gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6'>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <h3 id='warehouse-stock' className='text-base font-semibold'>{t("title")}</h3>
          <p className='text-sm text-muted-foreground'>{t("description")}</p>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <label className='relative'>
            <span className='sr-only'>{t("search")}</span>
            <HiOutlineMagnifyingGlass className='pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' aria-hidden='true' />
            <input type='search' value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("search")}
              className={cn(inputClass, "w-64 pl-8")} />
          </label>
          <Segmented label={t("filter")} value={query.belowMin ? "below" : "all"}
            options={[
              { value: "all", label: t("all") },
              { value: "below", label: t("belowMin") },
            ]}
            onChange={(value) => navigate({ below: value === "below" ? "1" : null, page: null })} />
        </div>
      </div>

      {empty ? (
        <div className='grid grid-cols-12'>
          <EmptyBlock icon={query.belowMin ? HiOutlineExclamationTriangle : HiOutlineCube}
            title={query.belowMin ? t("noneBelow") : query.q ? t("noResults") : t("emptyTitle")}
            description={query.belowMin || query.q ? undefined : t("emptyDescription")} />
        </div>
      ) : (
        <div className={cn("overflow-x-auto rounded-xl border border-border transition-opacity", pending && "opacity-60")} aria-busy={pending}>
          <table className='w-full min-w-[820px] text-sm'>
            <caption className='sr-only'>{t("title")}</caption>
            <thead className='bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground'>
              <tr>
                <th scope='col' className='px-3 py-2 font-medium'>{t("sku")}</th>
                <th scope='col' className='px-3 py-2 text-right font-medium'>{t("onHand")}</th>
                <th scope='col' className='px-3 py-2 text-right font-medium'>{t("reserved")}</th>
                <th scope='col' className='px-3 py-2 text-right font-medium'>{t("available")}</th>
                <th scope='col' className='px-3 py-2 text-right font-medium'>{t("min")}</th>
                <th scope='col' className='px-3 py-2 text-right font-medium'>{t("unitCost")}</th>
                <th scope='col' className='px-3 py-2 text-right font-medium'>{t("value")}</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {stock.items.map((row) => (
                <tr key={row.sku_id} className={cn(row.below_min && "bg-amber-500/5")}>
                  <td className='px-3 py-2'>
                    <div className='flex items-center gap-2'>
                      {row.below_min ? (
                        <HiOutlineExclamationTriangle className='h-4 w-4 shrink-0 text-amber-600' aria-label={t("belowMin")} />
                      ) : null}
                      <div className='min-w-0'>
                        <p className='truncate font-medium'>{[row.product_name, row.sku_name].filter(Boolean).join(" · ")}</p>
                        <p className='truncate font-mono text-xs text-muted-foreground'>{row.sku_code}</p>
                      </div>
                    </div>
                  </td>
                  <td className='px-3 py-2 text-right tabular-nums'>{formatNumber(row.on_hand ?? 0)}</td>
                  <td className='px-3 py-2 text-right tabular-nums text-muted-foreground'>{formatNumber(row.reserved ?? 0)}</td>
                  <td className={cn("px-3 py-2 text-right font-medium tabular-nums", row.below_min && "text-amber-700 dark:text-amber-400")}>
                    {formatNumber(row.available ?? 0)}
                  </td>
                  <td className='px-3 py-1'>
                    <MinCell warehouseId={warehouse.id!} row={row} />
                  </td>
                  <td className='px-3 py-2 text-right tabular-nums'>{row.unit_cost != null ? formatMoney(row.unit_cost) : "—"}</td>
                  <td className='px-3 py-2 text-right tabular-nums'>{row.stock_value != null ? formatMoney(row.stock_value) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {stock.totalPages > 1 ? (
        <nav aria-label={t("pagination")} className='flex items-center justify-between gap-3 text-sm'>
          <p className='text-muted-foreground'>{t("pageOf", { page: pageNumber, pages: stock.totalPages, total: formatNumber(stock.total) })}</p>
          <div className='flex gap-2'>
            <Buttons type='button' variant='outline' className='rounded-full' disabled={pageNumber <= 1 || pending}
              onClick={() => navigate({ page: pageNumber - 1 > 1 ? String(pageNumber - 1) : null })}>
              {t("previous")}
            </Buttons>
            <Buttons type='button' variant='outline' className='rounded-full' disabled={pageNumber >= stock.totalPages || pending}
              onClick={() => navigate({ page: String(pageNumber + 1) })}>
              {t("next")}
            </Buttons>
          </div>
        </nav>
      ) : null}
    </section>
  );
};
