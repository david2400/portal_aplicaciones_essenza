/** @format */

"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@repo/ui/form/scenes/form-field";
import { FormTextAreaField } from "@repo/ui/form/scenes/form-area";
import { FormSelectField } from "@repo/ui/form/scenes/form-select";
import { Buttons } from "@repo/ui/buttons/scenes/index";
import type { IFormProps } from "@repo/ui/form/models/form.interface";
import type { ISelectOption } from "@repo/ui/form/models";
import { HiOutlinePhoto } from "react-icons/hi2";
import {
  BrandLookupField,
  CategoryLookupField,
  SubcategoryLookupField,
  SupplierLookupField,
} from "@/components/async-combobox";
import { formatMoney } from "@/lib/format";
import { Link } from "@/shared/i18n/routing";
import { cn } from "@/lib/utils";
import { PRODUCT_STATUSES } from "../models/product.interface";
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

const IMAGE_URL = /^https?:\/\/\S+$/i;

const unitSelectClass =
  "h-9 rounded-md border border-gray-300 bg-white px-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800";

/** Selector compacto de unidad junto a un grupo de campos. */
const UnitSelect = ({
  label,
  value,
  units,
  onChange,
}: {
  label: string;
  value: string;
  units: IUnit[];
  onChange: (code: string) => void;
}) => (
  <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className={unitSelectClass}>
    {units.map((unit) => (
      <option key={unit.code} value={unit.code}>
        {unit.symbol}
      </option>
    ))}
  </select>
);

/** Bloque del formulario: título, ayuda y campos en rejilla. */
const Section = ({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) => (
  <section className='grid gap-4 border-b border-border pb-6 last:border-b-0 last:pb-0'>
    <div>
      <h3 className='text-base font-semibold text-foreground'>{title}</h3>
      {hint ? <p className='mt-0.5 text-sm text-muted-foreground'>{hint}</p> : null}
    </div>
    <div className='grid grid-cols-12 gap-4'>{children}</div>
  </section>
);

/** Tarjeta de la columna lateral. */
const Panel = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className='grid gap-3 rounded-xl border border-border bg-muted/20 p-4'>
    <h3 className='text-sm font-semibold text-foreground'>{title}</h3>
    {children}
  </section>
);

export interface FormProductProps extends IFormProps<any> {
  submitLabel?: string;
  /** Destino del botón Cancelar (sin él no se muestra). */
  cancelHref?: string;
  /** Producto con variantes: el stock es la suma de sus SKUs y no se edita aquí. */
  stockLocked?: boolean;
  /** Catálogo de unidades activas (medidas en cualquier unidad y contenido neto). */
  units?: IUnit[];
}

/**
 * Datos generales del producto (alta y pestaña "General" del editor): bloques de
 * información básica, clasificación, precios e inventario y medidas, con una columna
 * lateral de publicación, imagen principal y resumen de margen.
 */
export const FormProduct = ({
  initialValues,
  validationSchema,
  onSubmit,
  submitLabel,
  cancelHref,
  stockLocked = false,
  units = [],
}: FormProductProps) => {
  const t = useTranslations("Administre.product");
  const tForm = useTranslations("Administre.productEditor.form");
  const tCommon = useTranslations("Administre.common");
  type ProductInputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { isSubmitting, isDirty },
  } = useForm<ProductInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  const [categoryValue, imageUrl, unitPrice, realPrice, netContent, netContentUnitId] = useWatch({
    control,
    name: ["category_id", "image_url", "unit_price", "real_price", "net_content", "net_content_unit_id"],
  }) as [string | number, string | undefined, number | string, number | string, number | string, string];

  // Medidas: el backend guarda cm y kg; aquí se pueden escribir en cualquier unidad.
  const lengthUnits = unitsOf(units, "LENGTH");
  const massUnits = unitsOf(units, "MASS");
  const contentUnits = unitsOf(units, "VOLUME", "MASS", "COUNT", "LENGTH", "AREA");
  const [lengthCode, setLengthCode] = useState<string>(STORAGE_UNIT.length);
  const [weightCode, setWeightCode] = useState<string>(STORAGE_UNIT.weight);
  const canConvert = Boolean(unitByCode(lengthUnits, STORAGE_UNIT.length) && unitByCode(massUnits, STORAGE_UNIT.weight));

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

  const submitInStorageUnits = (values: Record<string, unknown>) => {
    const length = unitByCode(lengthUnits, lengthCode);
    const cm = unitByCode(lengthUnits, STORAGE_UNIT.length);
    const weight = unitByCode(massUnits, weightCode);
    const kg = unitByCode(massUnits, STORAGE_UNIT.weight);
    const toStorage = (value: unknown, from?: IUnit, to?: IUnit) => {
      const number = Number(value);
      const converted = convertUnit(number, from, to);
      return converted == null ? value : roundTo(converted, 4);
    };
    return onSubmit({
      ...values,
      length: toStorage(values.length, length, cm),
      width: toStorage(values.width, length, cm),
      height: toStorage(values.height, length, cm),
      weight: toStorage(values.weight, weight, kg),
    });
  };

  // Precio por unidad base del contenido neto ($/L, $/kg, $/und).
  const contentUnit = unitById(contentUnits, netContentUnitId);
  const contentBase = contentUnit ? contentUnits.find((unit) => unit.dimension === contentUnit.dimension && unit.base) : undefined;
  const contentInBase = contentUnit && contentBase ? convertUnit(Number(netContent), contentUnit, contentBase) : null;

  const categoryId = Number(categoryValue) || undefined;
  const sale = Number(unitPrice) || 0;
  const cost = Number(realPrice) || 0;
  const profit = sale - cost;
  const margin = sale > 0 ? profit / sale : null;
  const showImage = Boolean(imageUrl && IMAGE_URL.test(imageUrl.trim()));

  const statusOptions: ISelectOption[] = PRODUCT_STATUSES.map((status) => ({
    id: status,
    value: status,
    label: t(`statuses.${status}`),
  }));

  const booleanOptions: ISelectOption[] = [
    { id: "true", value: "true", label: tCommon("yes") },
    { id: "false", value: "false", label: tCommon("no") },
  ];

  return (
    <form onSubmit={handleSubmit(submitInStorageUnits)} className='grid gap-6'>
      <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]'>
        <div className='grid gap-6'>
          <Section title={tForm("basic")} hint={tForm("basicHint")}>
            <FormField controller={{ control, name: "name" }} label={t("fields.name")} className='col-span-12' />
            <FormTextAreaField
              controller={{ control, name: "description" }}
              label={t("fields.description")}
              placeholder={tForm("descriptionPlaceholder")}
              className='col-span-12'
            />
          </Section>

          <Section title={tForm("classification")} hint={tForm("classificationHint")}>
            <CategoryLookupField
              control={control}
              name='category_id'
              label={t("fields.categoryId")}
              placeholder={tCommon("selectPlaceholder")}
              onSelect={() => setValue("subcategory_id", "", { shouldDirty: true })}
              className='col-span-12 md:col-span-6'
            />
            <SubcategoryLookupField
              control={control}
              name='subcategory_id'
              label={t("fields.subcategoryId")}
              placeholder={categoryId ? tCommon("selectPlaceholder") : tForm("pickCategoryFirst")}
              categoryId={categoryId}
              disabled={!categoryId}
              className='col-span-12 md:col-span-6'
            />
            <BrandLookupField
              control={control}
              name='brand_id'
              label={t("fields.brandId")}
              placeholder={tCommon("selectPlaceholder")}
              className='col-span-12 md:col-span-6'
            />
            <SupplierLookupField
              control={control}
              name='supplier_id'
              label={t("fields.supplierId")}
              placeholder={tCommon("selectPlaceholder")}
              className='col-span-12 md:col-span-6'
            />
          </Section>

          <Section title={tForm("pricing")} hint={tForm("pricingHint")}>
            <FormField
              controller={{ control, name: "unit_price" }}
              type='number'
              step='0.01'
              min={0}
              label={t("fields.unitPrice")}
              className='col-span-12 sm:col-span-4'
            />
            <FormField
              controller={{ control, name: "real_price" }}
              type='number'
              step='0.01'
              min={0}
              label={t("fields.realPrice")}
              className='col-span-12 sm:col-span-4'
            />
            <FormField
              controller={{ control, name: "stock" }}
              type='number'
              step='1'
              min={0}
              disabled={stockLocked}
              label={t("fields.stock")}
              description={stockLocked ? tForm("stockLockedHint") : tForm("stockHint")}
              className='col-span-12 sm:col-span-4'
            />
            <FormField
              controller={{ control, name: "net_content" }}
              type='number'
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
          </Section>

          <Section title={tForm("dimensions")} hint={canConvert ? tForm("dimensionsUnitsHint") : tForm("dimensionsHint")}>
            {canConvert ? (
              <div className='col-span-12 flex flex-wrap items-center gap-3 text-sm'>
                <label className='flex items-center gap-2'>
                  <span className='text-muted-foreground'>{tForm("lengthUnit")}</span>
                  <UnitSelect
                    label={tForm("lengthUnit")}
                    value={lengthCode}
                    units={lengthUnits}
                    onChange={(code) => {
                      switchUnit(["length", "width", "height"], lengthCode, code, lengthUnits);
                      setLengthCode(code);
                    }}
                  />
                </label>
                <label className='flex items-center gap-2'>
                  <span className='text-muted-foreground'>{tForm("weightUnit")}</span>
                  <UnitSelect
                    label={tForm("weightUnit")}
                    value={weightCode}
                    units={massUnits}
                    onChange={(code) => {
                      switchUnit(["weight"], weightCode, code, massUnits);
                      setWeightCode(code);
                    }}
                  />
                </label>
              </div>
            ) : null}
            {(["length", "width", "height"] as const).map((name) => (
              <FormField
                key={name}
                controller={{ control, name }}
                type='number'
                step='any'
                min={0}
                label={canConvert ? `${tForm(`dim.${name}`)} (${unitByCode(lengthUnits, lengthCode)?.symbol ?? lengthCode})` : t(`fields.${name}`)}
                className='col-span-6 sm:col-span-3'
              />
            ))}
            <FormField
              controller={{ control, name: "weight" }}
              type='number'
              step='any'
              min={0}
              label={canConvert ? `${tForm("dim.weight")} (${unitByCode(massUnits, weightCode)?.symbol ?? weightCode})` : t("fields.weight")}
              className='col-span-6 sm:col-span-3'
            />
            {canConvert && (lengthCode !== STORAGE_UNIT.length || weightCode !== STORAGE_UNIT.weight) ? (
              <p className='col-span-12 text-xs text-muted-foreground'>{tForm("storedAs")}</p>
            ) : null}
          </Section>
        </div>

        <aside className='grid content-start gap-4 lg:sticky lg:top-4'>
          <Panel title={tForm("publishing")}>
            <FormSelectField
              controller={{ control, name: "status" }}
              label={t("fields.status")}
              description={tForm("statusHint")}
              data={statusOptions}
              triggerClassName='!w-full'
            />
            <FormSelectField
              controller={{ control, name: "is_combo" }}
              label={t("fields.isCombo")}
              description={tForm("comboHint")}
              data={booleanOptions}
              triggerClassName='!w-full'
            />
            <FormField
              controller={{ control, name: "slug" }}
              label={t("fields.slug")}
              description={t("slugHint")}
              placeholder={t("slugPlaceholder")}
            />
          </Panel>

          <Panel title={tForm("mainImage")}>
            <div className='flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-background'>
              {showImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl?.trim()} alt={tForm("mainImage")} className='h-full w-full object-cover' />
              ) : (
                <div className='flex flex-col items-center gap-2 p-6 text-center text-xs text-muted-foreground'>
                  <HiOutlinePhoto className='h-8 w-8' aria-hidden='true' />
                  {tForm("noImage")}
                </div>
              )}
            </div>
            <FormField controller={{ control, name: "image_url" }} label={t("fields.imageUrl")} placeholder='https://' />
            <p className='text-xs text-muted-foreground'>{tForm("galleryHint")}</p>
          </Panel>

          <Panel title={tForm("summary")}>
            <dl className='grid grid-cols-2 gap-3 text-sm'>
              <div>
                <dt className='text-muted-foreground'>{t("fields.unitPrice")}</dt>
                <dd className='font-semibold tabular-nums'>{formatMoney(sale)}</dd>
              </div>
              <div>
                <dt className='text-muted-foreground'>{t("fields.realPrice")}</dt>
                <dd className='font-semibold tabular-nums'>{formatMoney(cost)}</dd>
              </div>
              <div>
                <dt className='text-muted-foreground'>{tForm("profit")}</dt>
                <dd className={cn("font-semibold tabular-nums", profit < 0 && "text-destructive")}>{formatMoney(profit)}</dd>
              </div>
              <div>
                <dt className='text-muted-foreground'>{tForm("margin")}</dt>
                <dd
                  className={cn(
                    "font-semibold tabular-nums",
                    margin != null && margin < 0 && "text-destructive",
                    margin != null && margin >= 0 && margin < 0.15 && "text-warning",
                  )}>
                  {margin == null ? "—" : `${(margin * 100).toFixed(1)}%`}
                </dd>
              </div>
            </dl>
            {margin != null && margin < 0 ? <p className='text-xs text-destructive'>{tForm("negativeMargin")}</p> : null}
            {contentUnit && contentBase && contentInBase && contentInBase > 0 && sale > 0 ? (
              <p className='border-t border-border pt-3 text-sm'>
                <span className='text-muted-foreground'>{tForm("pricePer", { unit: contentBase.symbol ?? "" })}</span>{" "}
                <strong className='tabular-nums'>{formatMoney(sale / contentInBase)}</strong>
                <span className='block text-xs text-muted-foreground'>
                  {tForm("netContentShort")}: {formatQuantity(Number(netContent), contentUnit)}
                </span>
              </p>
            ) : null}
          </Panel>
        </aside>
      </div>

      <div className='sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-end gap-3 border-t border-border bg-card/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6'>
        {isDirty ? <span className='mr-auto text-sm text-muted-foreground'>{tForm("unsaved")}</span> : null}
        {cancelHref ? (
          <Link
            href={cancelHref}
            className='inline-flex h-10 items-center rounded-full border border-border px-5 text-sm font-medium text-foreground hover:bg-muted'>
            {tCommon("cancel")}
          </Link>
        ) : null}
        <Buttons type='submit' loading={isSubmitting} className='rounded-full'>
          {submitLabel ?? tCommon("save")}
        </Buttons>
      </div>
    </form>
  );
};
