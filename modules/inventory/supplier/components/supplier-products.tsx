/** @format */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@repo/ui/modals/scenes/dialog/modal";
import { Buttons } from "@repo/ui/buttons/scenes";
import { FormField } from "@repo/ui/form/scenes/form-field";
import { HiOutlineCube, HiOutlinePencilSquare, HiOutlinePlus, HiOutlineStar, HiOutlineTrash, HiStar } from "react-icons/hi2";
import { SkuLookupField } from "@/components/async-combobox";
import { EmptyBlock, ToggleRow } from "@/components/form-sections";
import { confirm, notify } from "@/components/notifications";
import { formatMoney, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ISupplier, ISupplierProduct } from "../models/supplier.interface";
import { validationSupplierProduct, type SupplierProductFormValues } from "../schemas/supplier.schema";
import {
  deleteSupplierProductServerAction,
  saveSupplierProductServerAction,
} from "@/app/[locale]/inventory/suppliers/actions";

const marginTone = (margin?: number | null) =>
  margin == null ? "" : margin < 0 ? "text-destructive" : margin < 20 ? "text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400";

const ProductForm = ({
  supplier,
  product,
  onDone,
}: {
  supplier: ISupplier;
  product: ISupplierProduct | null;
  onDone: () => void;
}) => {
  const t = useTranslations("Administre.supplier.products");
  const tCommon = useTranslations("Administre.common");
  const router = useRouter();
  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<SupplierProductFormValues>({
    resolver: zodResolver(validationSupplierProduct()),
    defaultValues: {
      sku_id: product?.sku_id != null ? String(product.sku_id) : "",
      supplier_code: product?.supplier_code ?? "",
      unit_cost: product?.unit_cost != null ? String(product.unit_cost) : "",
      lead_time_days: product?.lead_time_days != null ? String(product.lead_time_days) : "",
      min_order_qty: String(product?.min_order_qty ?? 1),
      preferred: Boolean(product?.preferred),
      active: product?.active !== false,
    },
  });
  const values = useWatch({ control });
  const canPrefer = supplier.status === "ACTIVE" && values.active !== false;

  const submit = async (form: SupplierProductFormValues) => {
    const result = await saveSupplierProductServerAction(supplier.id!, product?.id ?? null, {
      sku_id: Number(form.sku_id),
      supplier_code: form.supplier_code.trim() || undefined,
      unit_cost: Number(form.unit_cost),
      lead_time_days: form.lead_time_days.trim() ? Number(form.lead_time_days) : undefined,
      min_order_qty: Number(form.min_order_qty),
      preferred: canPrefer && form.preferred,
      active: form.active,
    });
    if (!result.success) {
      notify.error(tCommon("errorTitle"), result.error);
      return;
    }
    notify.success(product ? tCommon("updatedSuccess") : t("added"), result.data?.product_name ?? undefined);
    onDone();
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(submit)} className='grid grid-cols-12 gap-4' noValidate>
      {product ? (
        <div className='col-span-12 rounded-xl bg-muted/40 p-3 text-sm'>
          <p className='font-medium'>{[product.product_name, product.sku_name].filter(Boolean).join(" · ")}</p>
          <p className='text-xs text-muted-foreground'>{product.sku_code}</p>
        </div>
      ) : (
        <SkuLookupField control={control} name='sku_id' label={t("sku")} required className='col-span-12' />
      )}
      <FormField controller={{ control, name: "unit_cost" }} label={t("unitCost")} inputMode='decimal' prefix='$' required
        className='col-span-12 md:col-span-6' />
      <FormField controller={{ control, name: "supplier_code" }} label={t("supplierCode")} description={t("supplierCodeHint")}
        className='col-span-12 md:col-span-6' />
      <FormField controller={{ control, name: "min_order_qty" }} label={t("minOrderQty")} inputMode='numeric'
        className='col-span-12 md:col-span-6' />
      <FormField controller={{ control, name: "lead_time_days" }} label={t("leadTime")} inputMode='numeric'
        description={supplier.lead_time_days != null ? t("leadTimeDefault", { days: supplier.lead_time_days }) : undefined}
        className='col-span-12 md:col-span-6' />
      <div className='col-span-12 grid gap-3'>
        <ToggleRow id='sp-preferred' label={t("preferred")}
          description={canPrefer ? t("preferredHint") : t("preferredDisabled")} disabled={!canPrefer}
          checked={canPrefer && Boolean(values.preferred)} onChange={(checked) => setValue("preferred", checked)} />
        <ToggleRow id='sp-active' label={t("active")} description={t("activeHint")} checked={values.active !== false}
          onChange={(checked) => setValue("active", checked)} />
      </div>
      <div className='col-span-12 flex justify-end gap-2'>
        <Buttons type='button' variant='outline' className='rounded-full' onClick={onDone}>
          {tCommon("cancel")}
        </Buttons>
        <Buttons type='submit' loading={isSubmitting} className='rounded-full'>
          {product ? tCommon("save") : t("add")}
        </Buttons>
      </div>
    </form>
  );
};

/** SKU que surte el proveedor: costo, margen sobre el precio de venta, entrega y proveedor preferido. */
export const SupplierProducts = ({ supplier, products }: { supplier: ISupplier; products: ISupplierProduct[] }) => {
  const t = useTranslations("Administre.supplier.products");
  const tCommon = useTranslations("Administre.common");
  const router = useRouter();
  const [editing, setEditing] = useState<{ open: boolean; product: ISupplierProduct | null }>({ open: false, product: null });

  const remove = async (product: ISupplierProduct) => {
    const ok = await confirm({
      title: t("removeTitle"),
      description: t("removeText", { name: [product.product_name, product.sku_name].filter(Boolean).join(" · ") }),
      confirmLabel: t("remove"),
      tone: "danger",
    });
    if (!ok) return;
    const result = await deleteSupplierProductServerAction(supplier.id!, product.id!);
    if (!result.success) {
      notify.error(tCommon("errorTitle"), result.error);
      return;
    }
    notify.success(t("removed"));
    router.refresh();
  };

  const addButton = (
    <Buttons type='button' className='rounded-full' onClick={() => setEditing({ open: true, product: null })}>
      <HiOutlinePlus className='h-4 w-4' aria-hidden='true' />
      {t("add")}
    </Buttons>
  );

  return (
    <section aria-labelledby='supplier-products' className='grid gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h3 id='supplier-products' className='text-base font-semibold'>{t("title")}</h3>
          <p className='text-sm text-muted-foreground'>{t("description")}</p>
        </div>
        {products.length > 0 ? addButton : null}
      </div>

      {products.length === 0 ? (
        <div className='grid grid-cols-12'>
          <EmptyBlock icon={HiOutlineCube} title={t("emptyTitle")} description={t("emptyDescription")} action={addButton} />
        </div>
      ) : (
        <div className='overflow-x-auto rounded-xl border border-border'>
          <table className='w-full min-w-[760px] text-sm'>
            <caption className='sr-only'>{t("title")}</caption>
            <thead className='bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground'>
              <tr>
                <th scope='col' className='px-3 py-2 font-medium'>{t("sku")}</th>
                <th scope='col' className='px-3 py-2 font-medium'>{t("supplierCode")}</th>
                <th scope='col' className='px-3 py-2 text-right font-medium'>{t("unitCost")}</th>
                <th scope='col' className='px-3 py-2 text-right font-medium'>{t("salePrice")}</th>
                <th scope='col' className='px-3 py-2 text-right font-medium'>{t("margin")}</th>
                <th scope='col' className='px-3 py-2 text-right font-medium'>{t("minOrderQty")}</th>
                <th scope='col' className='px-3 py-2 text-right font-medium'>{t("leadTimeShort")}</th>
                <th scope='col' className='px-3 py-2'><span className='sr-only'>{tCommon("actions")}</span></th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {products.map((product) => (
                <tr key={product.id} className={cn(!product.active && "text-muted-foreground")}>
                  <td className='px-3 py-2'>
                    <div className='flex items-center gap-2'>
                      {product.preferred ? (
                        <HiStar className='h-4 w-4 shrink-0 text-amber-500' aria-label={t("preferred")} />
                      ) : (
                        <HiOutlineStar className='h-4 w-4 shrink-0 text-muted-foreground/40' aria-hidden='true' />
                      )}
                      <div className='min-w-0'>
                        <p className='truncate font-medium text-foreground'>{[product.product_name, product.sku_name].filter(Boolean).join(" · ")}</p>
                        <p className='truncate text-xs text-muted-foreground'>
                          {product.sku_code}
                          {!product.active ? ` · ${t("inactive")}` : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className='px-3 py-2 font-mono text-xs'>{product.supplier_code ?? "—"}</td>
                  <td className='px-3 py-2 text-right tabular-nums'>{formatMoney(product.unit_cost)}</td>
                  <td className='px-3 py-2 text-right tabular-nums'>{formatMoney(product.sale_price)}</td>
                  <td className={cn("px-3 py-2 text-right font-medium tabular-nums", marginTone(product.margin_percent))}>
                    {product.margin_percent != null ? `${formatNumber(product.margin_percent)} %` : "—"}
                  </td>
                  <td className='px-3 py-2 text-right tabular-nums'>{formatNumber(product.min_order_qty ?? 1)}</td>
                  <td className='px-3 py-2 text-right tabular-nums'>
                    {product.effective_lead_time_days != null ? t("days", { days: product.effective_lead_time_days }) : "—"}
                  </td>
                  <td className='px-3 py-2'>
                    <div className='flex justify-end gap-1'>
                      <Buttons type='button' variant='ghost' size='icon' aria-label={t("edit")}
                        onClick={() => setEditing({ open: true, product })}>
                        <HiOutlinePencilSquare className='h-4 w-4' aria-hidden='true' />
                      </Buttons>
                      <Buttons type='button' variant='ghost' size='icon' aria-label={t("remove")} onClick={() => remove(product)}>
                        <HiOutlineTrash className='h-4 w-4 text-destructive' aria-hidden='true' />
                      </Buttons>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal size='md' open={editing.open} title={editing.product ? t("editTitle") : t("addTitle")}
        onOpenChange={(open) => !open && setEditing({ open: false, product: null })} hideDefaultFooter={true}>
        {editing.open ? (
          <ProductForm supplier={supplier} product={editing.product} onDone={() => setEditing({ open: false, product: null })} />
        ) : null}
      </Modal>
    </section>
  );
};
