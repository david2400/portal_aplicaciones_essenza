/** @format */

"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import type { FieldValues } from "react-hook-form";
import {
  lookup_brands_action,
  lookup_categories_action,
  lookup_products_action,
  lookup_skus_action,
  lookup_subcategories_action,
  lookup_suppliers_action,
  type LookupResult,
} from "@/server/domains/lookups/actions";
import type { LookupOptionDto, ProductLookupDto, SkuLookupDto } from "@/server/domains/lookups/types";
import { formatMoney, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ComboOption } from "./async-combobox";
import { FormAsyncCombobox, type FormAsyncComboboxProps } from "./form-async-combobox";
import { FormAsyncMultiCombobox, type FormAsyncMultiComboboxProps } from "./form-async-multi-combobox";

/** Desenvuelve el resultado de la server action (lanza para que el combobox muestre el error). */
const unwrap = <T,>(result: LookupResult<T>): T[] => {
  if (!result.success) throw new Error(result.error);
  return result.data;
};

const numericId = (value: string) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

/** Hook genérico: `search` por texto y `resolve` por id, mapeando el DTO a opción. */
function useLookup<D, P extends object>(
  action: (params: P & { q?: string; ids?: number[] }) => Promise<LookupResult<D>>,
  toOption: (dto: D) => ComboOption<D>,
  params: P,
) {
  const key = JSON.stringify(params);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const search = useCallback(async (q: string) => unwrap(await action({ ...params, q })).map(toOption), [key]);
  const resolve = useCallback(
    async (value: string) => {
      const id = numericId(value);
      if (id == null) return null;
      const [found] = unwrap(await action({ ...params, ids: [id] }));
      return found ? toOption(found) : null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  return { search, resolve };
}

type FieldProps<TValues extends FieldValues, D> = Omit<FormAsyncComboboxProps<TValues, D>, "search" | "resolve">;

// ─── SKU ─────────────────────────────────────────────────────────────────────

export const skuOption = (sku: SkuLookupDto): ComboOption<SkuLookupDto> => ({
  value: String(sku.sku_id),
  label: sku.name ?? sku.code ?? `#${sku.sku_id}`,
  hint: [sku.code, formatMoney(sku.unit_price)].filter(Boolean).join(" · "),
  data: sku,
});

/** SKU (producto o variante) con código, precio y disponible. `sellableOnly` = solo lo que se puede vender. */
export function SkuLookupField<TValues extends FieldValues>({
  sellableOnly = false,
  productId,
  ...props
}: FieldProps<TValues, SkuLookupDto> & { sellableOnly?: boolean; productId?: number }) {
  const t = useTranslations("Lookup");
  const { search, resolve } = useLookup(lookup_skus_action, skuOption, {
    sellable_only: sellableOnly,
    product_id: productId,
  });
  return (
    <FormAsyncCombobox<TValues, SkuLookupDto>
      searchPlaceholder={t("skuSearch")}
      {...props}
      search={search}
      resolve={resolve}
      renderOption={(option) => {
        const sku = option.data;
        const available = sku?.available ?? 0;
        return (
          <div className='flex items-center justify-between gap-3'>
            <div className='min-w-0'>
              <p className='truncate'>{option.label}</p>
              <p className='truncate text-xs text-muted-foreground'>{option.hint}</p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-xs tabular-nums",
                available > 0 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
              )}>
              {t("available", { count: formatNumber(available) })}
            </span>
          </div>
        );
      }}
    />
  );
}

// ─── Producto ────────────────────────────────────────────────────────────────

/** Producto por nombre o slug. `statuses` limita por estado editorial. */
export function ProductLookupField<TValues extends FieldValues>({
  statuses,
  ...props
}: FieldProps<TValues, ProductLookupDto> & { statuses?: string[] }) {
  const t = useTranslations("Lookup");
  const tStatus = useTranslations("Administre.product.statuses");
  const toOption = (product: ProductLookupDto): ComboOption<ProductLookupDto> => ({
    value: String(product.id),
    label: product.name ?? `#${product.id}`,
    hint: [`#${product.id}`, product.status ? tStatus(product.status) : null].filter(Boolean).join(" · "),
    data: product,
  });
  const { search, resolve } = useLookup(lookup_products_action, toOption, { statuses });
  return (
    <FormAsyncCombobox<TValues, ProductLookupDto>
      searchPlaceholder={t("productSearch")}
      {...props}
      search={search}
      resolve={resolve}
    />
  );
}

const productChip = (product: ProductLookupDto): ComboOption<ProductLookupDto> => ({
  value: String(product.id),
  label: product.name ?? `#${product.id}`,
  hint: `#${product.id}`,
  data: product,
});

/** Varios productos (p. ej. reglas de cupones). Guarda un arreglo de ids. */
export function ProductMultiLookupField<TValues extends FieldValues>(
  props: Omit<FormAsyncMultiComboboxProps<TValues, ProductLookupDto>, "search" | "resolveMany">,
) {
  const t = useTranslations("Lookup");
  const search = useCallback(async (q: string) => unwrap(await lookup_products_action({ q })).map(productChip), []);
  const resolveMany = useCallback(async (values: string[]) => {
    const ids = values.map(numericId).filter((id): id is number => id != null);
    return ids.length === 0 ? [] : unwrap(await lookup_products_action({ ids })).map(productChip);
  }, []);
  return (
    <FormAsyncMultiCombobox<TValues, ProductLookupDto>
      searchPlaceholder={t("productSearch")}
      {...props}
      search={search}
      resolveMany={resolveMany}
    />
  );
}

// ─── Maestros ────────────────────────────────────────────────────────────────

const masterOption = (item: LookupOptionDto): ComboOption<LookupOptionDto> => ({
  value: String(item.id),
  label: item.label ?? `#${item.id}`,
  hint: item.hint ?? undefined,
  data: item,
});

export function BrandLookupField<TValues extends FieldValues>(props: FieldProps<TValues, LookupOptionDto>) {
  const { search, resolve } = useLookup(lookup_brands_action, masterOption, {});
  return <FormAsyncCombobox<TValues, LookupOptionDto> {...props} search={search} resolve={resolve} />;
}

export function CategoryLookupField<TValues extends FieldValues>(props: FieldProps<TValues, LookupOptionDto>) {
  const { search, resolve } = useLookup(lookup_categories_action, masterOption, {});
  return <FormAsyncCombobox<TValues, LookupOptionDto> {...props} search={search} resolve={resolve} />;
}

/** Subcategorías; con `categoryId` solo las de esa categoría. */
export function SubcategoryLookupField<TValues extends FieldValues>({
  categoryId,
  ...props
}: FieldProps<TValues, LookupOptionDto> & { categoryId?: number }) {
  const { search, resolve } = useLookup(lookup_subcategories_action, masterOption, { category_id: categoryId });
  return <FormAsyncCombobox<TValues, LookupOptionDto> {...props} search={search} resolve={resolve} />;
}

export function SupplierLookupField<TValues extends FieldValues>(props: FieldProps<TValues, LookupOptionDto>) {
  const { search, resolve } = useLookup(lookup_suppliers_action, masterOption, {});
  return <FormAsyncCombobox<TValues, LookupOptionDto> {...props} search={search} resolve={resolve} />;
}
