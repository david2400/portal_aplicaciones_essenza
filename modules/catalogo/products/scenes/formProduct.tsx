/** @format */

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Controller, useForm, useWatch, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@repo/ui/form/scenes/form-field";
import { FormTextAreaField } from "@repo/ui/form/scenes/form-area";
import { FormSelectField } from "@repo/ui/form/scenes/form-select";
import { Buttons } from "@repo/ui/buttons/scenes/index";
import type { IFormProps } from "@repo/ui/form/models/form.interface";
import {
  HiOutlineArchiveBox,
  HiOutlineBanknotes,
  HiOutlineCube,
  HiOutlineDocumentText,
  HiOutlineExclamationTriangle,
  HiOutlineEye,
  HiOutlineGlobeAlt,
  HiOutlinePhoto,
  HiOutlineRectangleStack,
  HiOutlineSquares2X2,
  HiOutlineSwatch,
  HiOutlineTag,
  HiOutlineTruck,
} from "react-icons/hi2";
import {
  BrandLookupField,
  CategoryLookupField,
  SubcategoryLookupField,
  SupplierLookupField,
} from "@/components/async-combobox";
import { notify } from "@/components/notifications";
import { formatMoney } from "@/lib/format";
import { Link } from "@/shared/i18n/routing";
import { cn } from "@/lib/utils";
import { PRODUCT_STATUSES, type ProductStatus } from "../models/product.interface";
import {
  convertUnit,
  formatQuantity,
  roundTo,
  STORAGE_UNIT,
  unitByCode,
  unitById,
  unitsOf,
  type IUnit,
} from "@/shared/units/units";
import { ChoiceCard, Segmented, SectionCard, SectionNav, type FormSectionItem, type SectionState } from "../components/form-parts";

const IMAGE_URL = /^https?:\/\/\S+$/i;
const NAME_MAX = 255;
const DESCRIPTION_MAX = 255;
/** Divisor del peso volumétrico (cm³ → kg) que usan las transportadoras. */
const VOLUMETRIC_DIVISOR = 5000;
const MARGIN_TARGETS = [0.3, 0.4, 0.5] as const;

/** Tipo de producto que se elige al crear (las variantes se agregan después). */
export type ProductKind = "SIMPLE" | "VARIANT" | "COMBO";

const STATUS_TONE: Record<ProductStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  ACTIVE: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  INACTIVE: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  ARCHIVED: "bg-destructive/10 text-destructive",
};

const slugify = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);

/** Campo → sección, para llevar al usuario a la primera sección con error. */
const FIELD_SECTION: Record<string, string> = {
  is_combo: "product-type",
  name: "product-basic",
  description: "product-basic",
  slug: "product-basic",
  category_id: "product-classification",
  subcategory_id: "product-classification",
  brand_id: "product-classification",
  supplier_id: "product-classification",
  unit_price: "product-pricing",
  real_price: "product-pricing",
  stock: "product-pricing",
  net_content: "product-logistics",
  net_content_unit_id: "product-logistics",
  length: "product-logistics",
  width: "product-logistics",
  height: "product-logistics",
  weight: "product-logistics",
  image_url: "product-media",
  status: "product-media",
};

const filled = (value: unknown) => value != null && String(value).trim() !== "";
const positive = (value: unknown) => Number(value) > 0;

export interface FormProductProps extends IFormProps<any> {
  submitLabel?: string;
  /** Destino del botón Cancelar (sin él no se muestra). */
  cancelHref?: string;
  /** Producto con variantes: el stock es la suma de sus SKUs y no se edita aquí. */
  stockLocked?: boolean;
  /** Catálogo de unidades activas (medidas en cualquier unidad y contenido neto). */
  units?: IUnit[];
  /** Alta: tipo elegible (simple, con variantes, combo). Edición: tipo actual del producto. */
  mode?: "create" | "edit";
  productType?: string | null;
  onKindChange?: (kind: ProductKind) => void;
}

/**
 * Datos generales del producto (alta y pestaña "General" del editor). Página única por
 * secciones en tarjetas con índice lateral de progreso, vista previa en vivo, ayudas de
 * precio (margen objetivo), logística (volumen y peso volumétrico) y barra de guardado
 * fija con resumen de pendientes. Ctrl/⌘ + S guarda.
 */
export const FormProduct = ({
  initialValues,
  validationSchema,
  onSubmit,
  submitLabel,
  cancelHref,
  stockLocked = false,
  units = [],
  mode = "edit",
  productType = null,
  onKindChange,
}: FormProductProps) => {
  const t = useTranslations("Administre.product");
  const tForm = useTranslations("Administre.productEditor.form");
  const tTypes = useTranslations("Administre.productEditor.types");
  const tCommon = useTranslations("Administre.common");
  type ProductInputs = z.infer<typeof validationSchema>;

  const formRef = useRef<HTMLFormElement>(null);
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { isSubmitting, isDirty, errors, submitCount },
  } = useForm<ProductInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
    mode: "onTouched",
  });

  const watched = useWatch({ control }) as Record<string, unknown>;
  const {
    name = "",
    description = "",
    slug = "",
    category_id: categoryValue,
    image_url: imageUrl,
    unit_price: unitPrice,
    real_price: realPrice,
    net_content: netContent,
    net_content_unit_id: netContentUnitId,
    status = "DRAFT",
    is_combo: isCombo,
  } = watched as Record<string, string | number | boolean | undefined>;

  // ─── Tipo de producto ─────────────────────────────────────────────────────────
  const initialKind: ProductKind =
    productType === "VARIANT" ? "VARIANT" : String(initialValues?.is_combo) === "true" ? "COMBO" : "SIMPLE";
  const [kind, setKind] = useState<ProductKind>(initialKind);
  const chooseKind = (next: ProductKind) => {
    setKind(next);
    setValue("is_combo" as never, (next === "COMBO" ? "true" : "false") as never, { shouldDirty: true });
    onKindChange?.(next);
  };
  useEffect(() => {
    // Mantiene la tarjeta alineada si el valor cambia por fuera (reset del formulario).
    if (kind !== "VARIANT") setKind(String(isCombo) === "true" ? "COMBO" : "SIMPLE");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCombo]);

  // ─── Medidas: el backend guarda cm y kg; aquí se escriben en cualquier unidad ──
  const lengthUnits = unitsOf(units, "LENGTH");
  const massUnits = unitsOf(units, "MASS");
  const contentUnits = unitsOf(units, "VOLUME", "MASS", "COUNT", "LENGTH", "AREA");
  const [lengthCode, setLengthCode] = useState<string>(STORAGE_UNIT.length);
  const [weightCode, setWeightCode] = useState<string>(STORAGE_UNIT.weight);
  const canConvert = Boolean(unitByCode(lengthUnits, STORAGE_UNIT.length) && unitByCode(massUnits, STORAGE_UNIT.weight));
  const lengthSymbol = unitByCode(lengthUnits, lengthCode)?.symbol ?? lengthCode;
  const weightSymbol = unitByCode(massUnits, weightCode)?.symbol ?? weightCode;

  /** Al cambiar de unidad se convierten los valores escritos (mismo tamaño real). */
  const switchUnit = (fields: readonly ("length" | "width" | "height" | "weight")[], from: string, to: string, pool: IUnit[]) => {
    const source = unitByCode(pool, from);
    const target = unitByCode(pool, to);
    for (const field of fields) {
      const raw = getValues(field as never) as unknown;
      const value = Number(raw);
      if (raw === "" || raw == null || !Number.isFinite(value)) continue;
      const converted = convertUnit(value, source, target);
      if (converted != null) setValue(field as never, roundTo(converted, 4) as never, { shouldDirty: true });
    }
  };

  const toStorage = (value: unknown, kindOf: "length" | "weight") => {
    const pool = kindOf === "length" ? lengthUnits : massUnits;
    const from = unitByCode(pool, kindOf === "length" ? lengthCode : weightCode);
    const to = unitByCode(pool, STORAGE_UNIT[kindOf]);
    const converted = convertUnit(Number(value), from, to);
    return converted == null ? value : roundTo(converted, 4);
  };

  const submitInStorageUnits = (values: Record<string, unknown>) =>
    onSubmit({
      ...values,
      length: toStorage(values.length, "length"),
      width: toStorage(values.width, "length"),
      height: toStorage(values.height, "length"),
      weight: toStorage(values.weight, "weight"),
    });

  /** Validación fallida: aviso con el número de campos y salto a la primera sección afectada. */
  const onInvalid = (fieldErrors: FieldErrors) => {
    const fields = Object.keys(fieldErrors);
    const order = sectionsOrder;
    const first = order.find((section) => fields.some((field) => FIELD_SECTION[field] === section));
    notify.error(tForm("invalidTitle"), tForm("invalidText", { count: fields.length }));
    if (first) document.getElementById(first)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submit = handleSubmit(submitInStorageUnits, onInvalid);

  // Ctrl/⌘ + S guarda sin salir del formulario.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Aviso del navegador al salir con cambios sin guardar.
  useEffect(() => {
    if (!isDirty || isSubmitting) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty, isSubmitting]);

  // ─── Cálculos ─────────────────────────────────────────────────────────────────
  const contentUnit = unitById(contentUnits, netContentUnitId as string | undefined);
  const contentBase = contentUnit ? contentUnits.find((unit) => unit.dimension === contentUnit.dimension && unit.base) : undefined;
  const contentInBase = contentUnit && contentBase ? convertUnit(Number(netContent), contentUnit, contentBase) : null;

  const categoryId = Number(categoryValue) || undefined;
  const sale = Number(unitPrice) || 0;
  const cost = Number(realPrice) || 0;
  const profit = sale - cost;
  const margin = sale > 0 ? profit / sale : null;
  const markup = cost > 0 ? profit / cost : null;
  const showImage = Boolean(typeof imageUrl === "string" && IMAGE_URL.test(imageUrl.trim()));
  const slugPreview = (typeof slug === "string" && slug.trim()) || slugify(String(name ?? ""));

  const suggestPrice = (target: number) => {
    // Precio para el margen objetivo, redondeado hacia arriba a la centena (COP).
    const price = Math.ceil(cost / (1 - target) / 100) * 100;
    setValue("unit_price" as never, price as never, { shouldDirty: true, shouldValidate: true });
  };

  const dims = (["length", "width", "height"] as const).map((field) => Number(toStorage(watched[field], "length")) || 0);
  const weightKg = Number(toStorage(watched.weight, "weight")) || 0;
  const volumeCm3 = (dims[0] ?? 0) * (dims[1] ?? 0) * (dims[2] ?? 0);
  const volumetricKg = volumeCm3 / VOLUMETRIC_DIVISOR;
  const billableKg = Math.max(weightKg, volumetricKg);

  // ─── Estado de cada sección ───────────────────────────────────────────────────
  const errorIn = (section: string) => Object.keys(errors).some((field) => FIELD_SECTION[field] === section);
  const stateOf = (section: string, complete: boolean, optional = false): SectionState =>
    submitCount > 0 && errorIn(section) ? "error" : complete ? "complete" : optional ? "optional" : "pending";

  const sections: FormSectionItem[] = [
    ...(mode === "create" ? [{ id: "product-type", title: tForm("type"), state: "complete" as SectionState }] : []),
    {
      id: "product-basic",
      title: tForm("basic"),
      state: stateOf("product-basic", filled(name) && filled(description)),
    },
    {
      id: "product-classification",
      title: tForm("classification"),
      state: stateOf(
        "product-classification",
        positive(watched.category_id) && positive(watched.subcategory_id) && positive(watched.brand_id) && positive(watched.supplier_id),
      ),
    },
    { id: "product-pricing", title: tForm("pricing"), state: stateOf("product-pricing", sale > 0) },
    {
      id: "product-logistics",
      title: tForm("dimensions"),
      state: stateOf("product-logistics", volumeCm3 > 0 || weightKg > 0 || filled(netContent), true),
    },
    { id: "product-media", title: tForm("publishingMedia"), state: stateOf("product-media", showImage, true) },
  ];
  const sectionsOrder = sections.map((section) => section.id);
  const pending = sections.filter((section) => section.state === "pending" || section.state === "error");
  const stateLabel = (state: SectionState) => tForm(`state.${state}`);

  const statusOptions = useMemo(
    () => PRODUCT_STATUSES.map((value) => ({ value, label: t(`statuses.${value}`) })),
    [t],
  );

  return (
    <form ref={formRef} onSubmit={submit} noValidate className='grid gap-6'>
      <div className='grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)_320px] lg:grid-cols-[minmax(0,1fr)_320px]'>
        {/* Índice de secciones */}
        <aside className='hidden xl:block'>
          <div className='sticky top-[var(--sticky-offset,5rem)]'>
            <SectionNav
              items={sections}
              title={tForm("sectionsTitle")}
              progressLabel={tForm("progress", {
                done: sections.filter((s) => s.id !== "product-logistics" && s.id !== "product-media" && s.state === "complete").length,
                total: sections.filter((s) => s.id !== "product-logistics" && s.id !== "product-media").length,
              })}
            />
          </div>
        </aside>

        <div className='grid min-w-0 content-start gap-6'>
          {mode === "create" ? (
            <SectionCard id='product-type' icon={HiOutlineSquares2X2} title={tForm("type")} hint={tForm("typeHint")}>
              <div className='col-span-12 grid gap-3 md:grid-cols-3' role='radiogroup' aria-label={tForm("type")}>
                <ChoiceCard
                  name='product-kind'
                  value='SIMPLE'
                  icon={HiOutlineCube}
                  title={tTypes("SIMPLE")}
                  description={tForm("kind.SIMPLE")}
                  selected={kind === "SIMPLE"}
                  onSelect={() => chooseKind("SIMPLE")}
                />
                <ChoiceCard
                  name='product-kind'
                  value='VARIANT'
                  icon={HiOutlineSwatch}
                  title={tTypes("VARIANT")}
                  description={tForm("kind.VARIANT")}
                  selected={kind === "VARIANT"}
                  onSelect={() => chooseKind("VARIANT")}
                />
                <ChoiceCard
                  name='product-kind'
                  value='COMBO'
                  icon={HiOutlineRectangleStack}
                  title={tTypes("COMBO")}
                  description={tForm("kind.COMBO")}
                  selected={kind === "COMBO"}
                  onSelect={() => chooseKind("COMBO")}
                />
              </div>
            </SectionCard>
          ) : null}

          <SectionCard
            id='product-basic'
            icon={HiOutlineDocumentText}
            title={tForm("basic")}
            hint={tForm("basicHint")}
            state={sections.find((s) => s.id === "product-basic")?.state}
            stateLabel={stateLabel(sections.find((s) => s.id === "product-basic")!.state)}>
            <FormField
              controller={{ control, name: "name" }}
              label={t("fields.name")}
              placeholder={tForm("namePlaceholder")}
              maxLength={NAME_MAX}
              required
              description={tForm("charCount", { count: String(name ?? "").length, max: NAME_MAX })}
              className='col-span-12'
            />
            <FormTextAreaField
              controller={{ control, name: "description" }}
              label={t("fields.description")}
              placeholder={tForm("descriptionPlaceholder")}
              maxLength={DESCRIPTION_MAX}
              required
              description={tForm("charCount", { count: String(description ?? "").length, max: DESCRIPTION_MAX })}
              className='col-span-12'
            />
            <FormField
              controller={{ control, name: "slug" }}
              label={t("fields.slug")}
              placeholder={slugify(String(name ?? "")) || t("slugPlaceholder")}
              description={t("slugHint")}
              prefix='/'
              className='col-span-12 md:col-span-7'
            />
            <div className='col-span-12 flex items-end md:col-span-5'>
              <p className='flex w-full min-w-0 items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground'>
                <HiOutlineGlobeAlt className='h-4 w-4 shrink-0' aria-hidden='true' />
                <span className='truncate'>
                  {tForm("urlPreview")} <span className='font-mono text-foreground'>/{slugPreview || "…"}</span>
                </span>
              </p>
            </div>
          </SectionCard>

          <SectionCard
            id='product-classification'
            icon={HiOutlineTag}
            title={tForm("classification")}
            hint={tForm("classificationHint")}
            state={sections.find((s) => s.id === "product-classification")?.state}
            stateLabel={stateLabel(sections.find((s) => s.id === "product-classification")!.state)}>
            <CategoryLookupField
              control={control}
              name='category_id'
              label={`${t("fields.categoryId")} *`}
              placeholder={tCommon("selectPlaceholder")}
              onSelect={() => setValue("subcategory_id", "", { shouldDirty: true })}
              className='col-span-12 md:col-span-6'
            />
            <SubcategoryLookupField
              control={control}
              name='subcategory_id'
              label={`${t("fields.subcategoryId")} *`}
              placeholder={categoryId ? tCommon("selectPlaceholder") : tForm("pickCategoryFirst")}
              categoryId={categoryId}
              disabled={!categoryId}
              className='col-span-12 md:col-span-6'
            />
            <BrandLookupField
              control={control}
              name='brand_id'
              label={`${t("fields.brandId")} *`}
              placeholder={tCommon("selectPlaceholder")}
              className='col-span-12 md:col-span-6'
            />
            <SupplierLookupField
              control={control}
              name='supplier_id'
              label={`${t("fields.supplierId")} *`}
              placeholder={tCommon("selectPlaceholder")}
              className='col-span-12 md:col-span-6'
            />
          </SectionCard>

          <SectionCard
            id='product-pricing'
            icon={HiOutlineBanknotes}
            title={tForm("pricing")}
            hint={tForm("pricingHint")}
            state={sections.find((s) => s.id === "product-pricing")?.state}
            stateLabel={stateLabel(sections.find((s) => s.id === "product-pricing")!.state)}>
            <FormField
              controller={{ control, name: "real_price" }}
              type='number'
              inputMode='decimal'
              step='0.01'
              min={0}
              prefix='$'
              label={t("fields.realPrice")}
              description={tForm("costHint")}
              className='col-span-12 sm:col-span-6 lg:col-span-4'
            />
            <FormField
              controller={{ control, name: "unit_price" }}
              type='number'
              inputMode='decimal'
              step='0.01'
              min={0}
              prefix='$'
              required
              label={t("fields.unitPrice")}
              description={tForm("priceHint")}
              className='col-span-12 sm:col-span-6 lg:col-span-4'
            />
            <FormField
              controller={{ control, name: "stock" }}
              type='number'
              inputMode='numeric'
              step='1'
              min={0}
              disabled={stockLocked || kind === "VARIANT"}
              label={mode === "create" ? tForm("initialStock") : t("fields.stock")}
              description={
                stockLocked ? tForm("stockLockedHint") : kind === "VARIANT" ? tForm("stockVariantHint") : tForm("stockHint")
              }
              suffix={tForm("unitsSuffix")}
              className='col-span-12 lg:col-span-4'
            />

            {/* Rentabilidad */}
            <div className='col-span-12 grid gap-3 rounded-xl border border-border bg-muted/20 p-4 sm:grid-cols-4'>
              <Metric label={tForm("profit")} value={formatMoney(profit)} tone={profit < 0 ? "bad" : undefined} />
              <Metric
                label={tForm("margin")}
                value={margin == null ? "—" : `${(margin * 100).toFixed(1)}%`}
                tone={margin == null ? undefined : margin < 0 ? "bad" : margin < 0.15 ? "warn" : "good"}
              />
              <Metric label={tForm("markup")} value={markup == null ? "—" : `${(markup * 100).toFixed(1)}%`} />
              <div className='grid content-start gap-1.5'>
                <span className='text-xs text-muted-foreground'>{tForm("suggestPrice")}</span>
                <div className='flex flex-wrap gap-1.5'>
                  {MARGIN_TARGETS.map((target) => (
                    <button
                      key={target}
                      type='button'
                      disabled={cost <= 0}
                      onClick={() => suggestPrice(target)}
                      title={cost > 0 ? formatMoney(Math.ceil(cost / (1 - target) / 100) * 100) : tForm("suggestNeedsCost")}
                      className='rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-medium tabular-nums text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50'>
                      {Math.round(target * 100)}%
                    </button>
                  ))}
                </div>
              </div>
              {margin != null ? (
                <div className='sm:col-span-4'>
                  <div className='h-1.5 overflow-hidden rounded-full bg-muted' aria-hidden='true'>
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        margin < 0 ? "bg-destructive" : margin < 0.15 ? "bg-amber-500" : "bg-emerald-500",
                      )}
                      style={{ width: `${Math.min(100, Math.max(4, Math.abs(margin) * 100))}%` }}
                    />
                  </div>
                  {margin < 0 ? (
                    <p className='mt-2 flex items-center gap-1.5 text-xs text-destructive'>
                      <HiOutlineExclamationTriangle className='h-4 w-4' aria-hidden='true' />
                      {tForm("negativeMargin")}
                    </p>
                  ) : margin < 0.15 ? (
                    <p className='mt-2 text-xs text-amber-700 dark:text-amber-400'>{tForm("lowMargin")}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </SectionCard>

          <SectionCard
            id='product-logistics'
            icon={HiOutlineTruck}
            title={tForm("dimensions")}
            hint={canConvert ? tForm("dimensionsUnitsHint") : tForm("dimensionsHint")}
            badge={tForm("optional")}
            state={sections.find((s) => s.id === "product-logistics")?.state}
            stateLabel={stateLabel(sections.find((s) => s.id === "product-logistics")!.state)}>
            <FormField
              controller={{ control, name: "net_content" }}
              type='number'
              inputMode='decimal'
              step='any'
              min={0}
              label={tForm("netContent")}
              description={tForm("netContentHint")}
              className='col-span-7 sm:col-span-4'
            />
            <FormSelectField
              controller={{ control, name: "net_content_unit_id" }}
              label={tForm("netContentUnit")}
              data={[
                { id: "none", value: "none", label: tForm("noUnit") },
                ...contentUnits.map((unit) => ({ id: String(unit.id), value: String(unit.id), label: `${unit.symbol} · ${unit.name}` })),
              ]}
              searchable
              triggerClassName='!w-full'
              className='col-span-5 sm:col-span-4'
            />
            <div className='col-span-12 flex items-end sm:col-span-4'>
              {contentUnit && contentBase && contentInBase && contentInBase > 0 && sale > 0 ? (
                <p className='w-full rounded-lg bg-muted/40 px-3 py-2 text-xs'>
                  <span className='text-muted-foreground'>{tForm("pricePer", { unit: contentBase.symbol ?? "" })}</span>{" "}
                  <strong className='tabular-nums text-foreground'>{formatMoney(sale / contentInBase)}</strong>
                </p>
              ) : null}
            </div>

            <div className='col-span-12 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4'>
              <span className='text-sm font-medium text-foreground'>{tForm("package")}</span>
              {canConvert ? (
                <div className='flex flex-wrap items-center gap-3'>
                  <Segmented
                    label={tForm("lengthUnit")}
                    value={lengthCode}
                    options={lengthUnits.map((unit) => ({ value: unit.code ?? "", label: unit.symbol ?? unit.code ?? "", title: unit.name }))}
                    onChange={(code) => {
                      switchUnit(["length", "width", "height"], lengthCode, code, lengthUnits);
                      setLengthCode(code);
                    }}
                  />
                  <Segmented
                    label={tForm("weightUnit")}
                    value={weightCode}
                    options={massUnits.map((unit) => ({ value: unit.code ?? "", label: unit.symbol ?? unit.code ?? "", title: unit.name }))}
                    onChange={(code) => {
                      switchUnit(["weight"], weightCode, code, massUnits);
                      setWeightCode(code);
                    }}
                  />
                </div>
              ) : null}
            </div>
            {(["length", "width", "height"] as const).map((field) => (
              <FormField
                key={field}
                controller={{ control, name: field }}
                type='number'
                inputMode='decimal'
                step='any'
                min={0}
                label={canConvert ? tForm(`dim.${field}`) : t(`fields.${field}`)}
                suffix={canConvert ? lengthSymbol : undefined}
                className='col-span-6 sm:col-span-3'
              />
            ))}
            <FormField
              controller={{ control, name: "weight" }}
              type='number'
              inputMode='decimal'
              step='any'
              min={0}
              label={canConvert ? tForm("dim.weight") : t("fields.weight")}
              suffix={canConvert ? weightSymbol : undefined}
              className='col-span-6 sm:col-span-3'
            />
            <div className='col-span-12 grid gap-3 rounded-xl border border-border bg-muted/20 p-4 sm:grid-cols-3'>
              <Metric label={tForm("volume")} value={volumeCm3 > 0 ? `${roundTo(volumeCm3 / 1000, 3)} L` : "—"} />
              <Metric label={tForm("volumetricWeight")} value={volumetricKg > 0 ? `${roundTo(volumetricKg, 2)} kg` : "—"} />
              <Metric label={tForm("billableWeight")} value={billableKg > 0 ? `${roundTo(billableKg, 2)} kg` : "—"} hint={tForm("billableHint")} />
            </div>
            {canConvert && (lengthCode !== STORAGE_UNIT.length || weightCode !== STORAGE_UNIT.weight) ? (
              <p className='col-span-12 text-xs text-muted-foreground'>{tForm("storedAs")}</p>
            ) : null}
          </SectionCard>

          <SectionCard
            id='product-media'
            icon={HiOutlinePhoto}
            title={tForm("publishingMedia")}
            hint={tForm("publishingMediaHint")}
            state={sections.find((s) => s.id === "product-media")?.state}
            stateLabel={stateLabel(sections.find((s) => s.id === "product-media")!.state)}>
            <div className='col-span-12 grid gap-2'>
              <span className='text-sm font-medium text-foreground'>{t("fields.status")}</span>
              <Controller
                control={control}
                name={"status" as never}
                render={({ field }) => (
                  <div role='radiogroup' aria-label={t("fields.status")} className='grid gap-2 sm:grid-cols-2 xl:grid-cols-4'>
                    {statusOptions.map((option) => {
                      const selected = field.value === option.value;
                      return (
                        <label
                          key={option.value}
                          className={cn(
                            "flex cursor-pointer flex-col gap-1 rounded-xl border p-3 transition-all focus-within:ring-2 focus-within:ring-ring",
                            selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted/40",
                          )}>
                          <input
                            type='radio'
                            className='sr-only'
                            name='product-status'
                            value={option.value}
                            checked={selected}
                            onChange={() => field.onChange(option.value)}
                          />
                          <span className={cn("w-fit rounded-full px-2 py-0.5 text-xs font-semibold", STATUS_TONE[option.value])}>
                            {option.label}
                          </span>
                          <span className='text-xs leading-relaxed text-muted-foreground'>{tForm(`statusHelp.${option.value}`)}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              />
            </div>
            <FormField
              controller={{ control, name: "image_url" }}
              label={tForm("mainImage")}
              placeholder='https://'
              description={tForm("galleryHint")}
              className='col-span-12'
            />
            {mode === "edit" && kind !== "VARIANT" ? (
              <FormSelectField
                controller={{ control, name: "is_combo" }}
                label={t("fields.isCombo")}
                description={tForm("comboHint")}
                data={[
                  { id: "true", value: "true", label: tCommon("yes") },
                  { id: "false", value: "false", label: tCommon("no") },
                ]}
                triggerClassName='!w-full'
                className='col-span-12 md:col-span-6'
              />
            ) : null}
          </SectionCard>
        </div>

        {/* Vista previa */}
        <aside className='grid content-start gap-4'>
          <div className='grid gap-4 lg:sticky lg:top-[var(--sticky-offset,5rem)]'>
            <section className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm' aria-label={tForm("preview")}>
              <div className='flex items-center justify-between border-b border-border px-4 py-3'>
                <span className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                  <HiOutlineEye className='h-4 w-4 text-muted-foreground' aria-hidden='true' />
                  {tForm("preview")}
                </span>
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", STATUS_TONE[status as ProductStatus] ?? STATUS_TONE.DRAFT)}>
                  {t(`statuses.${(status as ProductStatus) ?? "DRAFT"}`)}
                </span>
              </div>
              <div className='flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-muted/40'>
                {showImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={String(imageUrl).trim()} alt={String(name || tForm("mainImage"))} className='h-full w-full object-cover' />
                ) : (
                  <div className='flex flex-col items-center gap-2 p-6 text-center text-xs text-muted-foreground'>
                    <HiOutlinePhoto className='h-10 w-10' aria-hidden='true' />
                    {tForm("noImage")}
                  </div>
                )}
              </div>
              <div className='grid gap-2 p-4'>
                <span className='w-fit rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground'>
                  {tTypes(kind)}
                </span>
                <p className={cn("line-clamp-2 text-base font-semibold leading-snug", name ? "text-foreground" : "text-muted-foreground")}>
                  {String(name || tForm("namePreview"))}
                </p>
                {description ? <p className='line-clamp-3 text-sm text-muted-foreground'>{String(description)}</p> : null}
                <div className='flex items-baseline justify-between gap-2 border-t border-border pt-3'>
                  <span className='text-xl font-semibold tabular-nums text-foreground'>{formatMoney(sale)}</span>
                  {contentUnit && filled(netContent) ? (
                    <span className='text-xs text-muted-foreground'>{formatQuantity(Number(netContent), contentUnit)}</span>
                  ) : null}
                </div>
                {contentUnit && contentBase && contentInBase && contentInBase > 0 && sale > 0 ? (
                  <span className='text-xs text-muted-foreground'>
                    {tForm("pricePer", { unit: contentBase.symbol ?? "" })} {formatMoney(sale / contentInBase)}
                  </span>
                ) : null}
              </div>
            </section>

            <section className='grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm'>
              <h3 className='text-sm font-semibold text-foreground'>{tForm("checklist")}</h3>
              <ul className='grid gap-1.5 text-sm'>
                {sections
                  .filter((section) => section.id !== "product-type")
                  .map((section) => (
                    <li key={section.id} className='flex items-center justify-between gap-2'>
                      <button
                        type='button'
                        className='truncate text-left text-muted-foreground hover:text-foreground'
                        onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                        {section.title}
                      </button>
                      <span
                        className={cn(
                          "shrink-0 text-xs font-medium",
                          section.state === "complete" && "text-emerald-700 dark:text-emerald-400",
                          section.state === "error" && "text-destructive",
                          section.state === "pending" && "text-amber-700 dark:text-amber-400",
                          section.state === "optional" && "text-muted-foreground",
                        )}>
                        {stateLabel(section.state)}
                      </span>
                    </li>
                  ))}
              </ul>
              {mode === "create" ? (
                <p className='flex gap-2 border-t border-border pt-3 text-xs text-muted-foreground'>
                  <HiOutlineArchiveBox className='mt-0.5 h-4 w-4 shrink-0' aria-hidden='true' />
                  {tForm(`next.${kind}`)}
                </p>
              ) : null}
            </section>
          </div>
        </aside>
      </div>

      {/* Barra de acciones */}
      <div className='sticky bottom-3 z-20 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur'>
        <div className='mr-auto min-w-0 text-sm'>
          {pending.length > 0 ? (
            <span className='text-muted-foreground'>
              {tForm("pendingSections", { count: pending.length })}{" "}
              <span className='text-foreground'>{pending.map((section) => section.title).join(" · ")}</span>
            </span>
          ) : isDirty ? (
            <span className='text-muted-foreground'>{tForm("unsaved")}</span>
          ) : (
            <span className='text-muted-foreground'>{tForm("ready")}</span>
          )}
          <span className='ml-2 hidden text-xs text-muted-foreground md:inline'>{tForm("shortcut")}</span>
        </div>
        {cancelHref ? (
          <Link
            href={cancelHref}
            className='inline-flex h-10 items-center rounded-full border border-border px-5 text-sm font-medium text-foreground hover:bg-muted'>
            {tCommon("cancel")}
          </Link>
        ) : null}
        <Buttons type='submit' loading={isSubmitting} className='rounded-full px-6'>
          {submitLabel ?? tCommon("save")}
        </Buttons>
      </div>
    </form>
  );
};

/** Indicador numérico pequeño (rentabilidad, logística). */
const Metric = ({ label, value, tone, hint }: { label: string; value: string; tone?: "good" | "warn" | "bad"; hint?: string }) => (
  <div className='grid content-start gap-0.5' title={hint}>
    <span className='text-xs text-muted-foreground'>{label}</span>
    <span
      className={cn(
        "text-base font-semibold tabular-nums text-foreground",
        tone === "good" && "text-emerald-700 dark:text-emerald-400",
        tone === "warn" && "text-amber-700 dark:text-amber-400",
        tone === "bad" && "text-destructive",
      )}>
      {value}
    </span>
  </div>
);
