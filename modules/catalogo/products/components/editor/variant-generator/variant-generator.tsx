/** @format */

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Buttons } from "@repo/ui/buttons/scenes";
import {
  HiOutlineArrowDown,
  HiOutlineArrowPath,
  HiOutlineArrowUp,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlinePhoto,
  HiOutlinePlus,
  HiOutlineSparkles,
  HiOutlineSquares2X2,
  HiOutlineSwatch,
  HiOutlineTableCells,
  HiOutlineTrash,
  HiOutlineXMark,
} from "react-icons/hi2";
import { ActionBar, EmptyBlock, KpiStrip, SectionCard } from "@/components/form-sections";
import { confirm, notify } from "@/components/notifications";
import { formatMoney, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { IAttributeDefinition } from "../../../models/product-attributes.interface";
import type { INamedItem, IVariantMatrix } from "../../../models/product-editor.interface";
import {
  BARCODE,
  MAX_AXES,
  MAX_VARIANTS,
  SKU_CODE,
  adjustPrice,
  combinationsOf,
  keyOf,
  nameOf,
  normalizeCode,
  suggestCode,
  type Combination,
  type GenAxis,
} from "./logic";
import { createAxisOptionServerAction, saveVariantMatrixServerAction } from "@/app/[locale]/catalogo/products/actions";

type Variant = NonNullable<IVariantMatrix["variants"]>[number];

/** Datos editables de una fila (como texto, se convierten al guardar). */
interface RowEdit {
  price: string;
  cost: string;
  compareAt: string;
  skuCode: string;
  barcode: string;
  /** Imagen propia de la variante; vacía = la del valor del eje de imagen. */
  image: string;
  active: boolean;
  initialStock: string;
}

const inputClass =
  "h-8 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive";

const str = (value: number | string | null | undefined) => (value == null ? "" : String(value));
const num = (value: string) => (value.trim() === "" ? undefined : Number(value));
const isUrl = (value: string) => /^https?:\/\//i.test(value.trim());

const optionsOf = (variant: Variant): Combination =>
  Object.fromEntries((variant.options ?? []).map((ref) => [ref.attribute_id!, ref.option_id!])) as Combination;

/**
 * Asistente de variantes: 1) ejes y valores (con imagen por valor), 2) resumen de lo que va a
 * pasar, 3) matriz editable con acciones masivas. Se guarda todo en una sola operación.
 */
export const VariantGenerator = ({
  productId,
  matrix,
  attributes,
  warehouses,
}: {
  productId: number;
  matrix: IVariantMatrix;
  attributes: IAttributeDefinition[];
  warehouses: INamedItem[];
}) => {
  const t = useTranslations("Administre.productEditor.generator");
  const tCommon = useTranslations("Administre.common");
  const router = useRouter();
  const variants = useMemo(() => matrix.variants ?? [], [matrix.variants]);
  const basePrice = str(matrix.base_price);
  const baseCost = str(matrix.base_cost);

  // ── Estado ───────────────────────────────────────────────────────────────
  const [axes, setAxes] = useState<GenAxis[]>(() =>
    (matrix.axes ?? []).map((axis) => ({
      attributeId: axis.attribute_id!,
      name: axis.name ?? `#${axis.attribute_id}`,
      fromTemplate: Boolean(axis.from_template),
      imageAxis: Boolean(axis.image_axis),
      options: (axis.options ?? []).map((option) => ({ id: option.id!, value: option.value ?? "" })),
      selected: (axis.options ?? []).filter((option) => option.selected).map((option) => option.id!),
    })),
  );
  const [optionImages, setOptionImages] = useState<Record<number, string>>(() => {
    const images: Record<number, string> = {};
    (matrix.axes ?? []).forEach((axis) =>
      (axis.options ?? []).forEach((option) => {
        if (option.image_url && option.id != null) images[option.id] = option.image_url;
      }),
    );
    return images;
  });
  const [edits, setEdits] = useState<Record<string, Partial<RowEdit>>>({});
  /** Variantes sin combinación completa: valores asignados a mano o marcadas para quitar. */
  const [legacy, setLegacy] = useState<Record<number, { options: Combination; remove: boolean }>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [warehouseId, setWarehouseId] = useState("");
  const [base, setBase] = useState(matrix.base_code ?? `SKU-${productId}`);
  const [newValue, setNewValue] = useState<Record<number, string>>({});
  const [bulk, setBulk] = useState({ price: "", cost: "", compareAt: "", percent: "", roundTo: "0", stock: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imageAxis = axes.find((axis) => axis.imageAxis);
  const axisIds = new Set(axes.map((axis) => axis.attributeId));
  const addable = attributes.filter(
    (attribute) => attribute.data_type === "OPTION" && attribute.id != null && !axisIds.has(attribute.id),
  );
  const templateIds = new Set((matrix.available_attributes ?? []).filter((a) => a.from_template).map((a) => a.id));

  // ── Variantes existentes según los ejes actuales ─────────────────────────
  const existingByKey = useMemo(() => {
    const map = new Map<string, Variant>();
    variants.forEach((variant) => {
      const fromLegacy = variant.child_id != null ? legacy[variant.child_id] : undefined;
      if (fromLegacy?.remove) return;
      const combination = fromLegacy ? { ...optionsOf(variant), ...fromLegacy.options } : optionsOf(variant);
      const key = keyOf(axes, combination);
      if (key && !map.has(key)) map.set(key, variant);
    });
    return map;
  }, [variants, legacy, axes]);
  const pending = variants.filter((variant) => {
    if (variant.child_id == null) return false;
    const entry = legacy[variant.child_id];
    if (entry?.remove) return false;
    const combination = entry ? { ...optionsOf(variant), ...entry.options } : optionsOf(variant);
    return keyOf(axes, combination) == null;
  });

  const combinations = useMemo(() => combinationsOf(axes), [axes]);
  const rows = combinations.slice(0, MAX_VARIANTS + 1).map((combination) => {
    const key = keyOf(axes, combination)!;
    const existing = existingByKey.get(key);
    const ownImage =
      existing?.image_url && (!imageAxis || existing.image_url !== optionImages[combination[imageAxis.attributeId]!])
        ? existing.image_url
        : "";
    const defaults: RowEdit = {
      price: existing ? str(existing.price) : basePrice,
      cost: existing ? str(existing.cost_price) : "",
      compareAt: existing ? str(existing.compare_at_price) : "",
      skuCode: "",
      barcode: existing ? str(existing.barcode) : "",
      image: ownImage,
      active: existing ? existing.active !== false : true,
      initialStock: "",
    };
    const edit: RowEdit = { ...defaults, ...edits[key] };
    const suggested = suggestCode(base, axes, combination);
    return { key, combination, existing, edit, name: nameOf(axes, combination), suggested };
  });
  const tooMany = combinations.length > MAX_VARIANTS;
  const keys = new Set(rows.map((row) => row.key));
  const removals = variants.filter((variant) => {
    if (variant.child_id == null) return false;
    const entry = legacy[variant.child_id];
    if (entry?.remove) return true;
    const combination = entry ? { ...optionsOf(variant), ...entry.options } : optionsOf(variant);
    const key = keyOf(axes, combination);
    return key != null && !keys.has(key);
  });
  const toDeactivate = removals.filter((variant) => variant.has_history);
  const toDelete = removals.filter((variant) => !variant.has_history);
  const creates = rows.filter((row) => !row.existing);

  // ── Validación por fila ──────────────────────────────────────────────────
  const codes = new Map<string, number>();
  const barcodes = new Map<string, number>();
  rows.forEach((row) => {
    const code = row.edit.skuCode ? normalizeCode(row.edit.skuCode) : "";
    if (code) codes.set(code, (codes.get(code) ?? 0) + 1);
    if (row.edit.barcode) barcodes.set(row.edit.barcode.trim(), (barcodes.get(row.edit.barcode.trim()) ?? 0) + 1);
  });
  const rowErrors = (row: (typeof rows)[number]) => {
    const e: Partial<Record<keyof RowEdit, string>> = {};
    const price = Number(row.edit.price);
    if (!row.edit.price || !(price > 0)) e.price = t("errors.price");
    if (row.edit.cost && !(Number(row.edit.cost) >= 0)) e.cost = t("errors.cost");
    if (row.edit.compareAt && !(Number(row.edit.compareAt) > price)) e.compareAt = t("errors.compareAt");
    const code = row.edit.skuCode ? normalizeCode(row.edit.skuCode) : "";
    if (code && !SKU_CODE.test(code)) e.skuCode = t("errors.sku");
    else if (code && (codes.get(code) ?? 0) > 1) e.skuCode = t("errors.skuRepeated");
    const barcode = row.edit.barcode.trim();
    if (barcode && !BARCODE.test(barcode)) e.barcode = t("errors.barcode");
    else if (barcode && (barcodes.get(barcode) ?? 0) > 1) e.barcode = t("errors.barcodeRepeated");
    if (row.edit.image && !isUrl(row.edit.image)) e.image = t("errors.url");
    if (row.edit.initialStock && !/^\d{1,7}$/.test(row.edit.initialStock)) e.initialStock = t("errors.stock");
    return e;
  };
  const invalidRows = rows.filter((row) => Object.keys(rowErrors(row)).length > 0).length;
  const invalidImages = Object.entries(optionImages).some(([, url]) => url && !isUrl(url));
  const canSave =
    !saving && axes.length > 0 && rows.length > 0 && !tooMany && pending.length === 0 && invalidRows === 0 && !invalidImages;

  // ── Acciones sobre ejes ──────────────────────────────────────────────────
  const updateAxis = (attributeId: number, change: (axis: GenAxis) => GenAxis) =>
    setAxes((current) => current.map((axis) => (axis.attributeId === attributeId ? change(axis) : axis)));
  const toggleValue = (attributeId: number, optionId: number) =>
    updateAxis(attributeId, (axis) => ({
      ...axis,
      selected: axis.selected.includes(optionId) ? axis.selected.filter((id) => id !== optionId) : [...axis.selected, optionId],
    }));
  const moveAxis = (index: number, delta: number) =>
    setAxes((current) => {
      const next = [...current];
      const target = index + delta;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
  const addAxis = (attributeId: number) => {
    const attribute = attributes.find((item) => item.id === attributeId);
    if (!attribute || axes.length >= MAX_AXES) return;
    setAxes((current) => [
      ...current,
      {
        attributeId,
        name: attribute.name ?? `#${attributeId}`,
        fromTemplate: templateIds.has(attributeId),
        imageAxis: false,
        options: (attribute.options ?? [])
          .filter((option) => option.id != null)
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
          .map((option) => ({ id: option.id!, value: option.value ?? "" })),
        selected: [],
      },
    ]);
  };
  const removeAxis = (attributeId: number) => setAxes((current) => current.filter((axis) => axis.attributeId !== attributeId));
  const setImageAxis = (attributeId: number) =>
    setAxes((current) => current.map((axis) => ({ ...axis, imageAxis: axis.attributeId === attributeId ? !axis.imageAxis : false })));
  const createValue = async (axis: GenAxis) => {
    const value = (newValue[axis.attributeId] ?? "").trim();
    if (!value) return;
    const result = await createAxisOptionServerAction(productId, axis.attributeId, value);
    if (!result.success || !result.data?.id) {
      notify.error(tCommon("errorTitle"), result.success ? undefined : result.error);
      return;
    }
    const option = { id: result.data.id, value: result.data.value ?? value };
    updateAxis(axis.attributeId, (current) => ({
      ...current,
      options: current.options.some((o) => o.id === option.id) ? current.options : [...current.options, option],
      selected: current.selected.includes(option.id) ? current.selected : [...current.selected, option.id],
    }));
    setNewValue((current) => ({ ...current, [axis.attributeId]: "" }));
  };

  // ── Acciones sobre filas ─────────────────────────────────────────────────
  const editRow = (key: string, change: Partial<RowEdit>) =>
    setEdits((current) => ({ ...current, [key]: { ...current[key], ...change } }));
  const targets = () => (selected.size > 0 ? rows.filter((row) => selected.has(row.key)) : rows);
  const applyBulk = (field: "price" | "cost" | "compareAt" | "initialStock", value: string) => {
    if (value === "") return;
    setEdits((current) => {
      const next = { ...current };
      targets()
        .filter((row) => field !== "initialStock" || !row.existing)
        .forEach((row) => (next[row.key] = { ...next[row.key], [field]: value }));
      return next;
    });
  };
  const applyPercent = () => {
    const percent = Number(bulk.percent);
    if (!bulk.percent || Number.isNaN(percent)) return;
    setEdits((current) => {
      const next = { ...current };
      targets().forEach((row) => {
        const price = Number(row.edit.price);
        if (price > 0) next[row.key] = { ...next[row.key], price: String(adjustPrice(price, percent, Number(bulk.roundTo))) };
      });
      return next;
    });
  };
  const fillCodes = () =>
    setEdits((current) => {
      const next = { ...current };
      targets()
        .filter((row) => !row.existing)
        .forEach((row) => (next[row.key] = { ...next[row.key], skuCode: row.suggested }));
      return next;
    });
  const allSelected = rows.length > 0 && rows.every((row) => selected.has(row.key));

  // ── Guardar ──────────────────────────────────────────────────────────────
  const save = async () => {
    setError(null);
    if (removals.length > 0) {
      const ok = await confirm({
        title: t("confirmTitle"),
        description: t("confirmText", { deactivate: toDeactivate.length, delete: toDelete.length }),
        confirmLabel: t("save"),
        tone: toDelete.length > 0 ? "danger" : "default",
      });
      if (!ok) return;
    }
    setSaving(true);
    const result = await saveVariantMatrixServerAction(productId, {
      axes: axes.map((axis) => ({ attribute_id: axis.attributeId, image_axis: axis.imageAxis })),
      option_images: imageAxis
        ? imageAxis.selected
            .filter((id) => optionImages[id]?.trim())
            .map((id) => ({ option_id: id, image_url: optionImages[id]!.trim() }))
        : [],
      initial_warehouse_id: warehouseId ? Number(warehouseId) : undefined,
      variants: rows.map((row) => ({
        child_id: row.existing?.child_id ?? undefined,
        options: axes.map((axis) => ({ attribute_id: axis.attributeId, option_id: row.combination[axis.attributeId]! })),
        price: Number(row.edit.price),
        cost_price: num(row.edit.cost),
        compare_at_price: num(row.edit.compareAt),
        sku_code: row.edit.skuCode ? normalizeCode(row.edit.skuCode) : undefined,
        barcode: row.edit.barcode.trim() || undefined,
        image_url: row.edit.image.trim() || undefined,
        active: row.edit.active,
        initial_stock: row.existing ? undefined : num(row.edit.initialStock),
      })),
    });
    setSaving(false);
    if (!result.success || !result.data) {
      const message = result.success ? tCommon("unexpectedError") : result.error;
      setError(message);
      notify.error(tCommon("errorTitle"), message);
      return;
    }
    const data = result.data;
    notify.success(
      t("saved"),
      t("savedSummary", {
        created: data.created ?? 0,
        updated: data.updated ?? 0,
        deactivated: data.deactivated ?? 0,
        deleted: data.deleted ?? 0,
      }),
    );
    setEdits({});
    setLegacy({});
    setSelected(new Set());
    router.refresh();
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className='grid gap-6'>
      {/* 1. Ejes y valores */}
      <SectionCard id='gen-axes' icon={HiOutlineSwatch} title={t("step1")} hint={t("step1Hint")}
        state={axes.length > 0 && axes.every((axis) => axis.selected.length > 0) ? "complete" : "pending"}
        stateLabel={axes.length > 0 && axes.every((axis) => axis.selected.length > 0) ? t("stateReady") : t("statePending")}>
        <div className='col-span-12 grid gap-4'>
          {axes.length === 0 ? (
            <div className='grid grid-cols-12'>
              <EmptyBlock icon={HiOutlineSwatch} title={t("noAxes")} description={t("noAxesHint")} />
            </div>
          ) : null}
          {axes.map((axis, index) => (
            <fieldset key={axis.attributeId} className='grid gap-3 rounded-xl border border-border p-4'>
              <legend className='sr-only'>{axis.name}</legend>
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <div className='flex items-center gap-2'>
                  <span className='flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary'>
                    {index + 1}
                  </span>
                  <h4 className='font-semibold'>{axis.name}</h4>
                  {axis.fromTemplate ? <span className='rounded-full bg-muted px-2 py-0.5 text-xs'>{t("fromTemplate")}</span> : null}
                  <span className='text-xs text-muted-foreground'>{t("selectedCount", { count: axis.selected.length })}</span>
                </div>
                <div className='flex items-center gap-1'>
                  <label className='mr-2 flex cursor-pointer items-center gap-1.5 text-xs'>
                    <input type='checkbox' className='h-4 w-4 accent-primary' checked={axis.imageAxis}
                      onChange={() => setImageAxis(axis.attributeId)} />
                    <HiOutlinePhoto className='h-4 w-4 text-muted-foreground' aria-hidden='true' />
                    {t("imageAxis")}
                  </label>
                  <Buttons type='button' variant='ghost' size='icon' aria-label={t("moveUp", { name: axis.name })}
                    disabled={index === 0} onClick={() => moveAxis(index, -1)}>
                    <HiOutlineArrowUp className='h-4 w-4' aria-hidden='true' />
                  </Buttons>
                  <Buttons type='button' variant='ghost' size='icon' aria-label={t("moveDown", { name: axis.name })}
                    disabled={index === axes.length - 1} onClick={() => moveAxis(index, 1)}>
                    <HiOutlineArrowDown className='h-4 w-4' aria-hidden='true' />
                  </Buttons>
                  <Buttons type='button' variant='ghost' size='icon' aria-label={t("removeAxis", { name: axis.name })}
                    onClick={() => removeAxis(axis.attributeId)}>
                    <HiOutlineXMark className='h-4 w-4 text-destructive' aria-hidden='true' />
                  </Buttons>
                </div>
              </div>
              <div role='group' aria-label={t("valuesOf", { name: axis.name })} className='flex flex-wrap gap-2'>
                {axis.options.map((option) => {
                  const on = axis.selected.includes(option.id);
                  return (
                    <button key={option.id} type='button' aria-pressed={on} onClick={() => toggleValue(axis.attributeId, option.id)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        on ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/60 hover:bg-muted",
                      )}>
                      {option.value}
                    </button>
                  );
                })}
                <form className='flex items-center gap-1' onSubmit={(event) => { event.preventDefault(); void createValue(axis); }}>
                  <input aria-label={t("newValueFor", { name: axis.name })} placeholder={t("newValue")}
                    value={newValue[axis.attributeId] ?? ""} maxLength={120}
                    onChange={(event) => setNewValue((current) => ({ ...current, [axis.attributeId]: event.target.value }))}
                    className={cn(inputClass, "w-36 rounded-full")} />
                  <Buttons type='submit' variant='outline' size='icon' className='rounded-full' aria-label={t("addValue")}
                    disabled={!(newValue[axis.attributeId] ?? "").trim()}>
                    <HiOutlinePlus className='h-4 w-4' aria-hidden='true' />
                  </Buttons>
                </form>
              </div>
              {axis.imageAxis && axis.selected.length > 0 ? (
                <div className='grid gap-2 rounded-lg bg-muted/30 p-3 sm:grid-cols-2'>
                  <p className='text-xs text-muted-foreground sm:col-span-2'>{t("imageAxisHint")}</p>
                  {axis.options.filter((option) => axis.selected.includes(option.id)).map((option) => {
                    const url = optionImages[option.id] ?? "";
                    return (
                      <label key={option.id} className='flex items-center gap-2 text-sm'>
                        {url && isUrl(url) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={url} alt='' className='h-9 w-9 shrink-0 rounded-md border border-border object-cover' />
                        ) : (
                          <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-dashed border-border'>
                            <HiOutlinePhoto className='h-4 w-4 text-muted-foreground' aria-hidden='true' />
                          </span>
                        )}
                        <span className='w-24 shrink-0 truncate'>{option.value}</span>
                        <input type='url' placeholder='https://' value={url} aria-invalid={Boolean(url) && !isUrl(url)}
                          aria-label={t("imageFor", { value: option.value })}
                          onChange={(event) => setOptionImages((current) => ({ ...current, [option.id]: event.target.value }))}
                          className={inputClass} />
                      </label>
                    );
                  })}
                </div>
              ) : null}
            </fieldset>
          ))}
          {axes.length < MAX_AXES && addable.length > 0 ? (
            <div className='flex flex-wrap items-center gap-2'>
              <span className='text-sm text-muted-foreground'>{t("addAxis")}</span>
              {addable
                .sort((a, b) => Number(templateIds.has(b.id)) - Number(templateIds.has(a.id)))
                .map((attribute) => (
                  <Buttons key={attribute.id} type='button' variant='outline' className='h-8 rounded-full text-sm'
                    onClick={() => addAxis(attribute.id!)}>
                    <HiOutlinePlus className='h-3.5 w-3.5' aria-hidden='true' />
                    {attribute.name}
                    {templateIds.has(attribute.id) ? <span className='text-xs text-muted-foreground'>· {t("fromTemplate")}</span> : null}
                  </Buttons>
                ))}
            </div>
          ) : null}
        </div>
      </SectionCard>

      {/* Variantes sin combinación (anteriores al generador) */}
      {pending.length > 0 ? (
        <section role='alert' className='grid gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/5 p-4'>
          <div className='flex items-start gap-2'>
            <HiOutlineExclamationTriangle className='mt-0.5 h-5 w-5 shrink-0 text-amber-600' aria-hidden='true' />
            <div>
              <p className='font-medium'>{t("pendingTitle", { count: pending.length })}</p>
              <p className='text-sm text-muted-foreground'>{t("pendingText")}</p>
            </div>
          </div>
          <ul className='grid gap-2'>
            {pending.map((variant) => {
              const current = legacy[variant.child_id!]?.options ?? {};
              const merged = { ...optionsOf(variant), ...current };
              return (
                <li key={variant.child_id} className='flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-2 text-sm'>
                  <span className='min-w-32 font-medium'>{variant.name}</span>
                  <span className='font-mono text-xs text-muted-foreground'>{variant.sku_code}</span>
                  {axes.map((axis) => (
                    <select key={axis.attributeId} aria-label={t("assignValue", { axis: axis.name, name: variant.name ?? "" })}
                      value={merged[axis.attributeId] != null ? String(merged[axis.attributeId]) : ""}
                      onChange={(event) =>
                        setLegacy((all) => ({
                          ...all,
                          [variant.child_id!]: {
                            remove: false,
                            options: { ...current, [axis.attributeId]: Number(event.target.value) },
                          },
                        }))
                      }
                      className={cn(inputClass, "w-auto")}>
                      <option value=''>{axis.name}…</option>
                      {axis.options.filter((option) => axis.selected.includes(option.id)).map((option) => (
                        <option key={option.id} value={option.id}>{option.value}</option>
                      ))}
                    </select>
                  ))}
                  <Buttons type='button' variant='ghost' className='ml-auto h-8 rounded-full text-sm text-destructive'
                    onClick={() => setLegacy((all) => ({ ...all, [variant.child_id!]: { remove: true, options: current } }))}>
                    <HiOutlineTrash className='h-4 w-4' aria-hidden='true' />
                    {variant.has_history ? t("deactivateThis") : t("removeThis")}
                  </Buttons>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {/* 2. Resumen */}
      <SectionCard id='gen-summary' icon={HiOutlineSquares2X2} title={t("step2")} hint={t("step2Hint")}
        state={tooMany ? "error" : rows.length > 0 ? "complete" : "pending"}
        stateLabel={tooMany ? t("stateTooMany") : rows.length > 0 ? t("stateReady") : t("statePending")}>
        <div className='col-span-12 grid gap-3'>
          <KpiStrip
            items={[
              { label: t("combinations"), value: formatNumber(combinations.length), tone: tooMany ? "bad" : undefined, icon: HiOutlineTableCells },
              { label: t("toCreate"), value: formatNumber(creates.length), icon: HiOutlineSparkles, tone: creates.length > 0 ? "good" : undefined },
              { label: t("toDeactivate"), value: formatNumber(toDeactivate.length), tone: toDeactivate.length > 0 ? "warn" : undefined, icon: HiOutlineExclamationTriangle },
              { label: t("toDelete"), value: formatNumber(toDelete.length), tone: toDelete.length > 0 ? "bad" : undefined, icon: HiOutlineTrash },
            ]}
          />
          {tooMany ? <p role='alert' className='text-sm text-destructive'>{t("tooMany", { max: MAX_VARIANTS })}</p> : null}
          {removals.length > 0 ? (
            <ul className='grid gap-1 text-sm'>
              {removals.map((variant) => (
                <li key={variant.child_id} className='flex items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-1.5'>
                  <span>
                    <span className='font-medium'>{variant.name}</span>{" "}
                    <span className='font-mono text-xs text-muted-foreground'>{variant.sku_code}</span>
                  </span>
                  <span className={cn("text-xs", variant.has_history ? "text-amber-700 dark:text-amber-400" : "text-destructive")}>
                    {variant.has_history ? t("willDeactivate", { stock: formatNumber(variant.stock ?? 0) }) : t("willDelete")}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </SectionCard>

      {/* 3. Matriz */}
      <SectionCard id='gen-matrix' icon={HiOutlineTableCells} title={t("step3")} hint={t("step3Hint")}
        state={invalidRows > 0 ? "error" : rows.length > 0 ? "complete" : "pending"}
        stateLabel={invalidRows > 0 ? t("stateErrors", { count: invalidRows }) : rows.length > 0 ? t("stateReady") : t("statePending")}>
        {rows.length === 0 ? (
          <div className='col-span-12 grid grid-cols-12'>
            <EmptyBlock icon={HiOutlineTableCells} title={t("emptyMatrix")} description={t("emptyMatrixHint")} />
          </div>
        ) : (
          <div className='col-span-12 grid gap-3'>
            <div className='grid gap-3 rounded-xl border border-border bg-muted/20 p-3'>
              <p className='text-xs text-muted-foreground'>
                {selected.size > 0 ? t("bulkSelected", { count: selected.size }) : t("bulkAll", { count: rows.length })}
              </p>
              <div className='flex flex-wrap items-end gap-2'>
                {(["price", "cost", "compareAt"] as const).map((field) => (
                  <label key={field} className='grid gap-1 text-xs'>
                    {t(`columns.${field}`)}
                    <span className='flex gap-1'>
                      <input inputMode='decimal' value={bulk[field]} className={cn(inputClass, "w-28")}
                        onChange={(event) => setBulk((current) => ({ ...current, [field]: event.target.value }))} />
                      <Buttons type='button' variant='outline' className='h-8 rounded-md px-2 text-xs' disabled={!bulk[field]}
                        onClick={() => applyBulk(field, bulk[field])}>
                        {t("apply")}
                      </Buttons>
                    </span>
                  </label>
                ))}
                <label className='grid gap-1 text-xs'>
                  {t("adjust")}
                  <span className='flex gap-1'>
                    <input inputMode='decimal' value={bulk.percent} placeholder='%' className={cn(inputClass, "w-16")}
                      onChange={(event) => setBulk((current) => ({ ...current, percent: event.target.value }))} />
                    <select aria-label={t("roundTo")} value={bulk.roundTo} className={cn(inputClass, "w-28")}
                      onChange={(event) => setBulk((current) => ({ ...current, roundTo: event.target.value }))}>
                      <option value='0'>{t("noRound")}</option>
                      <option value='100'>{t("roundN", { n: "100" })}</option>
                      <option value='500'>{t("roundN", { n: "500" })}</option>
                      <option value='1000'>{t("roundN", { n: "1.000" })}</option>
                    </select>
                    <Buttons type='button' variant='outline' className='h-8 rounded-md px-2 text-xs' disabled={!bulk.percent} onClick={applyPercent}>
                      {t("apply")}
                    </Buttons>
                  </span>
                </label>
                {creates.length > 0 ? (
                  <label className='grid gap-1 text-xs'>
                    {t("initialStockNew")}
                    <span className='flex gap-1'>
                      <input inputMode='numeric' value={bulk.stock} className={cn(inputClass, "w-20")}
                        onChange={(event) => setBulk((current) => ({ ...current, stock: event.target.value.replace(/\D/g, "") }))} />
                      <Buttons type='button' variant='outline' className='h-8 rounded-md px-2 text-xs' disabled={!bulk.stock}
                        onClick={() => applyBulk("initialStock", bulk.stock)}>
                        {t("apply")}
                      </Buttons>
                    </span>
                  </label>
                ) : null}
              </div>
              <div className='flex flex-wrap items-end gap-3'>
                <label className='grid gap-1 text-xs'>
                  {t("baseCode")}
                  <input value={base} onChange={(event) => setBase(event.target.value.toUpperCase())} className={cn(inputClass, "w-40 font-mono")} />
                </label>
                <Buttons type='button' variant='outline' className='h-8 rounded-md text-xs' onClick={fillCodes} disabled={creates.length === 0}>
                  <HiOutlineArrowPath className='h-3.5 w-3.5' aria-hidden='true' />
                  {t("fillCodes")}
                </Buttons>
                {creates.length > 0 ? (
                  <label className='grid gap-1 text-xs'>
                    {t("initialWarehouse")}
                    <select value={warehouseId} onChange={(event) => setWarehouseId(event.target.value)} className={cn(inputClass, "w-56")}>
                      <option value=''>{t("mainWarehouse")}</option>
                      {warehouses.filter((w) => w.id != null).map((w) => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </label>
                ) : null}
              </div>
            </div>

            <div className='max-h-[32rem] overflow-auto rounded-xl border border-border'>
              <table className='w-full min-w-[1080px] text-sm'>
                <caption className='sr-only'>{t("step3")}</caption>
                <thead className='sticky top-0 z-10 bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground'>
                  <tr>
                    <th scope='col' className='w-8 px-2 py-2'>
                      <input type='checkbox' aria-label={t("selectAll")} className='h-4 w-4 accent-primary' checked={allSelected}
                        onChange={() => setSelected(allSelected ? new Set() : new Set(rows.map((row) => row.key)))} />
                    </th>
                    <th scope='col' className='px-2 py-2 font-medium'>{t("columns.variant")}</th>
                    <th scope='col' className='px-2 py-2 font-medium'>{t("columns.sku")}</th>
                    <th scope='col' className='px-2 py-2 font-medium'>{t("columns.barcode")}</th>
                    <th scope='col' className='px-2 py-2 font-medium'>{t("columns.price")}</th>
                    <th scope='col' className='px-2 py-2 font-medium'>{t("columns.cost")}</th>
                    <th scope='col' className='px-2 py-2 font-medium'>{t("columns.compareAt")}</th>
                    <th scope='col' className='px-2 py-2 font-medium'>{t("columns.image")}</th>
                    <th scope='col' className='px-2 py-2 font-medium'>{t("columns.stock")}</th>
                    <th scope='col' className='px-2 py-2 font-medium'>{t("columns.active")}</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-border'>
                  {rows.slice(0, MAX_VARIANTS).map((row) => {
                    const errors = rowErrors(row);
                    const optionImage = imageAxis ? optionImages[row.combination[imageAxis.attributeId]!] : undefined;
                    const preview = row.edit.image || optionImage || "";
                    const margin =
                      Number(row.edit.price) > 0 && (row.edit.cost || baseCost)
                        ? Math.round(((Number(row.edit.price) - Number(row.edit.cost || baseCost)) / Number(row.edit.price)) * 1000) / 10
                        : null;
                    return (
                      <tr key={row.key} className={cn(!row.edit.active && "opacity-60", selected.has(row.key) && "bg-primary/5")}>
                        <td className='px-2 py-1.5'>
                          <input type='checkbox' aria-label={t("selectRow", { name: row.name })} className='h-4 w-4 accent-primary'
                            checked={selected.has(row.key)}
                            onChange={() =>
                              setSelected((current) => {
                                const next = new Set(current);
                                if (next.has(row.key)) next.delete(row.key);
                                else next.add(row.key);
                                return next;
                              })
                            } />
                        </td>
                        <td className='px-2 py-1.5'>
                          <p className='font-medium'>{row.name}</p>
                          <p className='text-xs text-muted-foreground'>
                            {row.existing ? row.existing.sku_code : <span className='text-emerald-700 dark:text-emerald-400'>{t("new")}</span>}
                          </p>
                        </td>
                        <td className='px-2 py-1.5'>
                          <input value={row.edit.skuCode} placeholder={row.existing?.sku_code ?? row.suggested}
                            aria-label={t("skuFor", { name: row.name })} aria-invalid={Boolean(errors.skuCode)} title={errors.skuCode}
                            onChange={(event) => editRow(row.key, { skuCode: event.target.value.toUpperCase() })}
                            className={cn(inputClass, "w-44 font-mono text-xs")} />
                        </td>
                        <td className='px-2 py-1.5'>
                          <input value={row.edit.barcode} aria-label={t("barcodeFor", { name: row.name })}
                            aria-invalid={Boolean(errors.barcode)} title={errors.barcode}
                            onChange={(event) => editRow(row.key, { barcode: event.target.value })}
                            className={cn(inputClass, "w-36 font-mono text-xs")} />
                        </td>
                        <td className='px-2 py-1.5'>
                          <input inputMode='decimal' value={row.edit.price} aria-label={t("priceFor", { name: row.name })}
                            aria-invalid={Boolean(errors.price)} title={errors.price}
                            onChange={(event) => editRow(row.key, { price: event.target.value })}
                            className={cn(inputClass, "w-28 text-right tabular-nums")} />
                        </td>
                        <td className='px-2 py-1.5'>
                          <input inputMode='decimal' value={row.edit.cost} placeholder={baseCost}
                            aria-label={t("costFor", { name: row.name })} aria-invalid={Boolean(errors.cost)} title={errors.cost}
                            onChange={(event) => editRow(row.key, { cost: event.target.value })}
                            className={cn(inputClass, "w-24 text-right tabular-nums")} />
                          {margin != null ? (
                            <p className={cn("mt-0.5 text-right text-[11px] tabular-nums", margin < 20 ? "text-amber-700 dark:text-amber-400" : "text-muted-foreground")}>
                              {t("margin", { value: formatNumber(margin) })}
                            </p>
                          ) : null}
                        </td>
                        <td className='px-2 py-1.5'>
                          <input inputMode='decimal' value={row.edit.compareAt} aria-label={t("compareAtFor", { name: row.name })}
                            aria-invalid={Boolean(errors.compareAt)} title={errors.compareAt}
                            onChange={(event) => editRow(row.key, { compareAt: event.target.value })}
                            className={cn(inputClass, "w-24 text-right tabular-nums")} />
                        </td>
                        <td className='px-2 py-1.5'>
                          <div className='flex items-center gap-1.5'>
                            {preview && isUrl(preview) ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={preview} alt='' className='h-8 w-8 shrink-0 rounded border border-border object-cover' />
                            ) : (
                              <span className='h-8 w-8 shrink-0 rounded border border-dashed border-border' />
                            )}
                            <input type='url' value={row.edit.image} placeholder={optionImage ? t("fromValue") : "https://"}
                              aria-label={t("imageFor", { value: row.name })} aria-invalid={Boolean(errors.image)} title={errors.image}
                              onChange={(event) => editRow(row.key, { image: event.target.value })}
                              className={cn(inputClass, "w-36 text-xs")} />
                          </div>
                        </td>
                        <td className='px-2 py-1.5'>
                          {row.existing ? (
                            <span className='tabular-nums text-muted-foreground'>{formatNumber(row.existing.stock ?? 0)}</span>
                          ) : (
                            <input inputMode='numeric' value={row.edit.initialStock} placeholder='0'
                              aria-label={t("stockFor", { name: row.name })} aria-invalid={Boolean(errors.initialStock)}
                              onChange={(event) => editRow(row.key, { initialStock: event.target.value.replace(/\D/g, "") })}
                              className={cn(inputClass, "w-20 text-right tabular-nums")} />
                          )}
                        </td>
                        <td className='px-2 py-1.5 text-center'>
                          <input type='checkbox' aria-label={t("activeFor", { name: row.name })} className='h-4 w-4 accent-primary'
                            checked={row.edit.active} onChange={(event) => editRow(row.key, { active: event.target.checked })} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className='text-xs text-muted-foreground'>
              {t("priceRange", {
                min: formatMoney(Math.min(...rows.map((row) => Number(row.edit.price) || 0))),
                max: formatMoney(Math.max(...rows.map((row) => Number(row.edit.price) || 0))),
              })}
            </p>
          </div>
        )}
      </SectionCard>

      {error ? <p role='alert' className='rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive'>{error}</p> : null}

      <ActionBar
        message={
          pending.length > 0
            ? t("blockPending", { count: pending.length })
            : invalidRows > 0
              ? t("blockErrors", { count: invalidRows })
              : t("barSummary", { total: rows.length, created: creates.length, removed: removals.length })
        }>
        <Buttons type='button' className='rounded-full' loading={saving} disabled={!canSave} onClick={save}>
          <HiOutlineCheckCircle className='h-4 w-4' aria-hidden='true' />
          {t("save")}
        </Buttons>
      </ActionBar>
    </div>
  );
};
