/** @format */

"use client";

import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useFieldArray, useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  HiOutlineArrowDown,
  HiOutlineArrowUp,
  HiOutlineCalculator,
  HiOutlineCheckCircle,
  HiOutlineClipboardDocumentList,
  HiOutlineDocumentText,
  HiOutlineExclamationTriangle,
  HiOutlineInformationCircle,
  HiOutlineListBullet,
  HiOutlineLockClosed,
  HiOutlinePlus,
  HiOutlineTrash,
} from "react-icons/hi2";
import { FormField } from "@repo/ui/form/scenes/form-field";
import { FormTextAreaField } from "@repo/ui/form/scenes/form-area";
import { Buttons } from "@repo/ui/buttons/scenes/index";
import { Badge } from "@repo/ui/badges/scenes/badge";
import { Link } from "@/shared/i18n/routing";
import { cn } from "@/lib/utils";
import { convertUnit, formatQuantity, unitById, UNIT_DIMENSIONS, type IUnit, type UnitDimension } from "@/shared/units/units";
import { ATTRIBUTE_DATA_TYPES, codeFromName, type AttributeDataType, type IAttributeUsage } from "../models/attribute.interface";
import { validationAttribute, type AttributeFormInput, type AttributeFormValues } from "../schemas/attribute.schema";

type IconType = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" }>;

const TYPE_ICONS: Record<AttributeDataType, IconType> = {
  TEXT: HiOutlineDocumentText,
  NUMBER: HiOutlineCalculator,
  BOOLEAN: HiOutlineCheckCircle,
  OPTION: HiOutlineListBullet,
};

/** Valor de ejemplo por magnitud para la vista previa. */
const SAMPLE: Record<string, number> = { LENGTH: 30, MASS: 250, VOLUME: 500, AREA: 1.5, COUNT: 12 };

const NO_UNIT = "none";

const Section = ({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) => (
  <section className='grid gap-4 border-b border-border pb-6 last:border-b-0 last:pb-0'>
    <div>
      <h3 className='text-base font-semibold text-foreground'>{title}</h3>
      {hint ? <p className='mt-0.5 text-sm text-muted-foreground'>{hint}</p> : null}
    </div>
    {children}
  </section>
);

const Panel = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className='grid gap-3 rounded-xl border border-border bg-muted/20 p-4'>
    <h3 className='text-sm font-semibold text-foreground'>{title}</h3>
    {children}
  </section>
);

export interface FormAttributeProps {
  initialValues: AttributeFormInput;
  onSubmit: (values: AttributeFormValues) => Promise<void>;
  units: IUnit[];
  /** Uso del atributo (solo al editar). */
  usage?: IAttributeUsage | null;
  isNew?: boolean;
  /** El tipo ya no se puede cambiar (en uso). */
  typeLocked?: boolean;
  cancelHref: string;
  submitLabel?: string;
}

/**
 * Alta y edición de atributo: datos básicos, tipo (tarjetas), unidad del catálogo por
 * magnitud (números) u opciones (listas), con vista previa en la ficha y dónde se usa.
 */
export const FormAttribute = ({
  initialValues,
  onSubmit,
  units,
  usage = null,
  isNew = false,
  typeLocked = false,
  cancelHref,
  submitLabel,
}: FormAttributeProps) => {
  const t = useTranslations("Administre.attribute");
  const te = useTranslations("Administre.attribute.editor");
  const tUnits = useTranslations("Administre.unitMeasurement");
  const tCommon = useTranslations("Administre.common");

  const {
    control,
    handleSubmit,
    setValue,
    getFieldState,
    formState: { isSubmitting, isDirty, errors },
  } = useForm<AttributeFormInput, unknown, AttributeFormValues>({
    // El esquema convierte la unidad ("none" | "12") a número; el resolver tipa solo la salida.
    resolver: zodResolver(validationAttribute()) as unknown as Resolver<AttributeFormInput, unknown, AttributeFormValues>,
    defaultValues: initialValues,
  });
  const { fields, append, remove, move } = useFieldArray({ control, name: "options" });
  const [dataType, name, code, unitValue, options] = useWatch({
    control,
    name: ["data_type", "name", "code", "unit_id", "options"],
  }) as [AttributeDataType, string, string, string | number | undefined, { id?: number; value: string }[]];

  // Al crear, el código se propone desde el nombre mientras no se edite a mano.
  useEffect(() => {
    if (isNew && !getFieldState("code").isDirty && typeof name === "string") {
      setValue("code", codeFromName(name), { shouldValidate: false });
    }
  }, [isNew, name, getFieldState, setValue]);

  // ─── Unidad (números): primero la magnitud, después la unidad ─────────────────
  const unitId = unitValue == null || unitValue === "" || unitValue === NO_UNIT ? undefined : String(unitValue);
  const unit = unitById(units, unitId);
  const initialUnit = unitById(units, initialValues.unit_id === NO_UNIT ? undefined : initialValues.unit_id);
  const [dimension, setDimension] = useState<UnitDimension | "NONE">(
    (unit?.dimension as UnitDimension | undefined) ?? (unitId ? "OTHER" : "NONE"),
  );
  const dimensionUnits = useMemo(
    () => units.filter((u) => u.dimension === dimension && (u.active !== false || String(u.id) === unitId)),
    [units, dimension, unitId],
  );
  const chooseDimension = (next: UnitDimension | "NONE") => {
    setDimension(next);
    if (next === "NONE") {
      setValue("unit_id", NO_UNIT, { shouldDirty: true });
      return;
    }
    if (unit?.dimension === next) return;
    const base = units.find((u) => u.dimension === next && u.base) ?? units.find((u) => u.dimension === next && u.active !== false);
    setValue("unit_id", base?.id != null ? String(base.id) : NO_UNIT, { shouldDirty: true });
  };

  // Aviso de conversión al cambiar la unidad de un atributo con valores guardados.
  const storedValues = usage?.product_count ?? 0;
  const unitChanged = !isNew && dataType === "NUMBER" && String(initialUnit?.id ?? "") !== String(unit?.id ?? "");
  const sameDimension =
    initialUnit != null && unit != null && initialUnit.dimension === unit.dimension && unit.dimension !== "OTHER";
  const conversionExample = sameDimension ? convertUnit(1, initialUnit, unit) : null;

  // ─── Opciones ─────────────────────────────────────────────────────────────────
  const optionUsage = useMemo(
    () => new Map((usage?.options ?? []).map((option) => [option.option_id, option.count ?? 0])),
    [usage],
  );
  const [bulk, setBulk] = useState<string | null>(null);
  const addBulk = () => {
    const existing = new Set((options ?? []).map((option) => option.value.trim().toLocaleLowerCase("es")).filter(Boolean));
    const lines = (bulk ?? "")
      .split(/\r?\n|,|;/)
      .map((line) => line.trim())
      .filter(Boolean);
    const fresh: string[] = [];
    for (const line of lines) {
      const key = line.toLocaleLowerCase("es");
      if (!existing.has(key)) {
        existing.add(key);
        fresh.push(line.slice(0, 120));
      }
    }
    // Reemplaza la fila vacía inicial si la hay.
    if (fields.length === 1 && !(options?.[0]?.value ?? "").trim() && fresh.length > 0) remove(0);
    fresh.forEach((value) => append({ value }));
    setBulk(null);
  };
  const filledOptions = (options ?? []).filter((option) => option.value?.trim());
  const optionsError = (errors.options as { message?: string } | undefined)?.message;

  const submit = (values: AttributeFormValues) =>
    onSubmit({
      ...values,
      unit_id: values.data_type === "NUMBER" && String(values.unit_id ?? "") !== NO_UNIT ? values.unit_id : undefined,
    });

  // ─── Vista previa ─────────────────────────────────────────────────────────────
  const preview = (() => {
    switch (dataType) {
      case "NUMBER":
        return unit ? formatQuantity(SAMPLE[unit.dimension ?? ""] ?? 10, unit) : formatQuantity(10);
      case "BOOLEAN":
        return tCommon("yes");
      case "OPTION":
        return null;
      default:
        return te("previewText");
    }
  })();

  return (
    <form onSubmit={handleSubmit(submit)} className='grid gap-6'>
      <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]'>
        <div className='grid gap-6'>
          <Section title={te("basic")} hint={te("basicHint")}>
            <div className='grid grid-cols-12 gap-4'>
              <FormField
                controller={{ control, name: "name" }}
                label={t("fields.name")}
                placeholder={te("namePlaceholder")}
                className='col-span-12 md:col-span-7'
              />
              <FormField
                controller={{ control, name: "code" }}
                label={t("fields.code")}
                description={t("codeHint")}
                className='col-span-12 md:col-span-5'
              />
              <FormTextAreaField
                controller={{ control, name: "description" }}
                label={t("fields.description")}
                placeholder={te("descriptionPlaceholder")}
                rows={2}
                className='col-span-12'
              />
            </div>
          </Section>

          <Section title={t("fields.dataType")} hint={typeLocked ? t("typeLocked") : te("typeHint")}>
            <div role='radiogroup' aria-label={t("fields.dataType")} className='grid gap-3 sm:grid-cols-2'>
              {ATTRIBUTE_DATA_TYPES.map((type) => {
                const Icon = TYPE_ICONS[type];
                const selected = dataType === type;
                return (
                  <button
                    key={type}
                    type='button'
                    role='radio'
                    aria-checked={selected}
                    disabled={typeLocked && !selected}
                    onClick={() => setValue("data_type", type, { shouldDirty: true, shouldValidate: true })}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                      selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted/40",
                      typeLocked && !selected && "cursor-not-allowed opacity-50",
                    )}>
                    <span className={cn("rounded-lg p-2", selected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                      <Icon className='h-5 w-5' aria-hidden='true' />
                    </span>
                    <span className='min-w-0'>
                      <span className='flex items-center gap-2 font-semibold text-foreground'>
                        {t(`types.${type}`)}
                        {typeLocked && selected ? <HiOutlineLockClosed className='h-3.5 w-3.5 text-muted-foreground' aria-hidden='true' /> : null}
                      </span>
                      <span className='mt-0.5 block text-sm text-muted-foreground'>{t(`typeHints.${type}`)}</span>
                      <span className='mt-1 block text-xs text-muted-foreground'>{te(`examples.${type}`)}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Section>

          {dataType === "NUMBER" ? (
            <Section title={te("unit")} hint={te("unitHint")}>
              <div className='flex flex-wrap gap-2' role='radiogroup' aria-label={tUnits("fields.dimension")}>
                {(["NONE", ...UNIT_DIMENSIONS] as const).map((value) => {
                  const count = value === "NONE" ? null : units.filter((u) => u.dimension === value && u.active !== false).length;
                  if (count === 0 && value !== dimension) return null;
                  return (
                    <button
                      key={value}
                      type='button'
                      role='radio'
                      aria-checked={dimension === value}
                      onClick={() => chooseDimension(value)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm",
                        dimension === value ? "border-primary bg-primary/10 font-medium text-primary" : "border-border hover:bg-muted/40",
                      )}>
                      {value === "NONE" ? t("noUnit") : tUnits(`dimensions.${value}`)}
                    </button>
                  );
                })}
              </div>

              {dimension !== "NONE" ? (
                <div className='flex flex-wrap gap-2' role='radiogroup' aria-label={t("fields.unitId")}>
                  {dimensionUnits.map((u) => {
                    const selected = String(u.id) === unitId;
                    return (
                      <button
                        key={u.id}
                        type='button'
                        role='radio'
                        aria-checked={selected}
                        onClick={() => setValue("unit_id", String(u.id), { shouldDirty: true })}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                          selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted/40",
                        )}>
                        <span className='font-semibold'>{u.symbol}</span>
                        <span className='text-muted-foreground'>{u.name}</span>
                        {u.base ? <Badge variant='outline'>{te("base")}</Badge> : null}
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {unitChanged && storedValues > 0 ? (
                sameDimension ? (
                  <p className='flex gap-2 rounded-lg border border-border bg-muted/30 p-3 text-sm'>
                    <HiOutlineInformationCircle className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground' aria-hidden='true' />
                    {te("willConvert", {
                      count: storedValues,
                      from: initialUnit?.symbol ?? "",
                      to: unit?.symbol ?? "",
                      example: `1 ${initialUnit?.symbol} = ${formatQuantity(conversionExample, unit, 6)}`,
                    })}
                  </p>
                ) : (
                  <p className='flex gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive'>
                    <HiOutlineExclamationTriangle className='mt-0.5 h-4 w-4 shrink-0' aria-hidden='true' />
                    {te("cannotChangeDimension", { count: storedValues })}
                  </p>
                )
              ) : null}

              <p className='text-xs text-muted-foreground'>
                {te("unitsManage")}{" "}
                <Link href='/fichaTecnica/unit-measurements' className='font-medium text-primary underline-offset-4 hover:underline'>
                  {tUnits("title")}
                </Link>
              </p>
            </Section>
          ) : null}

          {dataType === "OPTION" ? (
            <Section title={t("fields.options")} hint={t("optionsHint")}>
              <ol className='grid gap-2'>
                {fields.map((field, index) => {
                  const used = optionUsage.get(options?.[index]?.id ?? -1) ?? 0;
                  return (
                    <li key={field.id} className='flex items-start gap-2'>
                      <span className='mt-2 w-6 shrink-0 text-right text-sm tabular-nums text-muted-foreground'>{index + 1}</span>
                      <FormField
                        controller={{ control, name: `options.${index}.value` as const }}
                        aria-label={t("optionLabel", { index: index + 1 })}
                        placeholder={te("optionPlaceholder")}
                        className='flex-1'
                      />
                      {used > 0 ? (
                        <Badge variant='secondary' className='mt-2 shrink-0'>
                          {te("optionUsed", { count: used })}
                        </Badge>
                      ) : null}
                      <div className='flex shrink-0 gap-1'>
                        <Buttons
                          type='button'
                          variant='ghost'
                          size='icon'
                          aria-label={te("moveUp")}
                          disabled={index === 0}
                          onClick={() => move(index, index - 1)}>
                          <HiOutlineArrowUp className='h-4 w-4' aria-hidden='true' />
                        </Buttons>
                        <Buttons
                          type='button'
                          variant='ghost'
                          size='icon'
                          aria-label={te("moveDown")}
                          disabled={index === fields.length - 1}
                          onClick={() => move(index, index + 1)}>
                          <HiOutlineArrowDown className='h-4 w-4' aria-hidden='true' />
                        </Buttons>
                        <Buttons
                          type='button'
                          variant='ghost'
                          size='icon'
                          aria-label={t("removeOption", { index: index + 1 })}
                          title={used > 0 ? te("optionLocked") : undefined}
                          disabled={used > 0}
                          onClick={() => remove(index)}>
                          <HiOutlineTrash className='h-4 w-4 text-destructive' aria-hidden='true' />
                        </Buttons>
                      </div>
                    </li>
                  );
                })}
              </ol>
              {optionsError ? <p className='text-sm text-destructive'>{optionsError}</p> : null}

              {bulk != null ? (
                <div className='grid gap-2 rounded-xl border border-border p-3'>
                  <label className='text-sm font-medium text-foreground' htmlFor='attribute-bulk-options'>
                    {te("bulkLabel")}
                  </label>
                  <textarea
                    id='attribute-bulk-options'
                    rows={5}
                    value={bulk}
                    onChange={(event) => setBulk(event.target.value)}
                    placeholder={te("bulkPlaceholder")}
                    className='w-full rounded-md border border-gray-300 bg-white p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800'
                  />
                  <div className='flex justify-end gap-2'>
                    <Buttons type='button' variant='outline' className='rounded-full' onClick={() => setBulk(null)}>
                      {tCommon("cancel")}
                    </Buttons>
                    <Buttons type='button' className='rounded-full' onClick={addBulk}>
                      {te("bulkAdd")}
                    </Buttons>
                  </div>
                </div>
              ) : null}

              <div className='flex flex-wrap items-center gap-2'>
                <Buttons type='button' variant='outline' className='rounded-full' onClick={() => append({ value: "" })}>
                  <HiOutlinePlus className='h-4 w-4' aria-hidden='true' />
                  {t("addOption")}
                </Buttons>
                {bulk == null ? (
                  <Buttons type='button' variant='ghost' className='rounded-full' onClick={() => setBulk("")}>
                    <HiOutlineClipboardDocumentList className='h-4 w-4' aria-hidden='true' />
                    {te("bulkOpen")}
                  </Buttons>
                ) : null}
                <span className='ml-auto text-xs text-muted-foreground'>{te("optionsCount", { count: filledOptions.length })}</span>
              </div>
            </Section>
          ) : null}
        </div>

        <aside className='grid content-start gap-4 lg:sticky lg:top-4'>
          <Panel title={te("preview")}>
            <p className='text-xs text-muted-foreground'>{te("previewHint")}</p>
            <dl className='grid gap-1 rounded-lg border border-border bg-background p-3 text-sm'>
              <dt className='text-muted-foreground'>{name?.trim() || te("namePlaceholder")}</dt>
              <dd className='font-medium text-foreground'>
                {dataType === "OPTION" ? (
                  filledOptions.length > 0 ? (
                    <span className='flex flex-wrap gap-1.5'>
                      {filledOptions.slice(0, 10).map((option, index) => (
                        <span
                          key={`${option.value}-${index}`}
                          className={cn(
                            "rounded-full border px-2.5 py-0.5 text-xs",
                            index === 0 ? "border-primary bg-primary/10 text-primary" : "border-border",
                          )}>
                          {option.value}
                        </span>
                      ))}
                      {filledOptions.length > 10 ? <span className='text-xs text-muted-foreground'>+{filledOptions.length - 10}</span> : null}
                    </span>
                  ) : (
                    <span className='text-muted-foreground'>{te("previewNoOptions")}</span>
                  )
                ) : (
                  preview
                )}
              </dd>
            </dl>
            <p className='font-mono text-xs text-muted-foreground'>{code || "codigo"}</p>
            {dataType === "OPTION" ? <p className='text-xs text-muted-foreground'>{te("variantHint")}</p> : null}
          </Panel>

          {!isNew ? (
            <Panel title={te("usage")}>
              {usage && ((usage.templates ?? []).length > 0 || (usage.product_count ?? 0) > 0 || (usage.variant_count ?? 0) > 0) ? (
                <div className='grid gap-3 text-sm'>
                  {(usage.templates ?? []).length > 0 ? (
                    <div className='grid gap-1.5'>
                      <span className='text-muted-foreground'>{te("usageTemplates")}</span>
                      <ul className='grid gap-1'>
                        {(usage.templates ?? []).map((template) => (
                          <li key={template.id} className='flex flex-wrap items-center gap-1.5'>
                            <Link href='/fichaTecnica/templates' className='font-medium text-foreground underline-offset-4 hover:underline'>
                              {template.name}
                            </Link>
                            {template.required ? <Badge variant='outline'>{te("required")}</Badge> : null}
                            {template.variant_axis ? <Badge variant='secondary'>{te("variantAxis")}</Badge> : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  <dl className='grid grid-cols-2 gap-2'>
                    <div>
                      <dt className='text-muted-foreground'>{te("usageProducts")}</dt>
                      <dd className='font-semibold tabular-nums'>{usage.product_count ?? 0}</dd>
                    </div>
                    <div>
                      <dt className='text-muted-foreground'>{te("usageVariants")}</dt>
                      <dd className='font-semibold tabular-nums'>{usage.variant_count ?? 0}</dd>
                    </div>
                  </dl>
                  {(usage.products ?? []).length > 0 ? (
                    <ul className='grid gap-1'>
                      {(usage.products ?? []).map((product) => (
                        <li key={product.id}>
                          <Link
                            href={`/catalogo/products/${product.id}?tab=specs`}
                            className='truncate text-primary underline-offset-4 hover:underline'>
                            {product.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>{te("usageNone")}</p>
              )}
            </Panel>
          ) : null}
        </aside>
      </div>

      <div className='sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-end gap-3 border-t border-border bg-card/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6'>
        {isDirty ? <span className='mr-auto text-sm text-muted-foreground'>{te("unsaved")}</span> : null}
        <Link
          href={cancelHref}
          className='inline-flex h-10 items-center rounded-full border border-border px-5 text-sm font-medium text-foreground hover:bg-muted'>
          {tCommon("cancel")}
        </Link>
        <Buttons type='submit' loading={isSubmitting} className='rounded-full'>
          {submitLabel ?? tCommon("save")}
        </Buttons>
      </div>
    </form>
  );
};
