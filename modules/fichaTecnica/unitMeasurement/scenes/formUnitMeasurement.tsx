/** @format */

"use client";

import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@repo/ui/form/scenes/form-field";
import { FormSelectField } from "@repo/ui/form/scenes/form-select";
import { Buttons } from "@repo/ui/buttons/scenes/index";
import { HiOutlineArrowsRightLeft, HiOutlineInformationCircle } from "react-icons/hi2";
import { formatQuantity, UNIT_DIMENSIONS, type IUnit } from "@/shared/units/units";
import type { UnitFormValues, validationUnitMeasurement } from "../schemas/unitMeasurement.schema";

/** "Bulto × 25 kg" → "bulto_25_kg" (igual que el backend). */
const deriveCode = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 20);

export const FormUnitMeasurement = ({
  initialValues,
  validationSchema,
  onSubmit,
  units,
  current,
}: {
  initialValues: UnitFormValues;
  validationSchema: ReturnType<typeof validationUnitMeasurement>;
  onSubmit: (values: UnitFormValues) => Promise<void>;
  /** Todas las unidades (para la base de cada magnitud). */
  units: IUnit[];
  /** Unidad en edición. */
  current?: IUnit | null;
}) => {
  const t = useTranslations("Administre.unitMeasurement");
  const tCommon = useTranslations("Administre.common");
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<UnitFormValues>({ resolver: zodResolver(validationSchema), defaultValues: initialValues });

  const [dimension, symbol, factorValue, isBase, code, name] = useWatch({
    control,
    name: ["dimension", "symbol", "factor", "base", "code", "name"],
  }) as [string, string, number | string | undefined, boolean | string, string | undefined, string];

  const base = units.find((unit) => unit.dimension === dimension && unit.base && unit.id !== current?.id);
  const becomesBase = String(isBase) === "true";
  const firstOfDimension = dimension !== "OTHER" && !base;
  const factor = Number(factorValue);
  const inUse = (current?.usage_count ?? 0) > 0;
  const shownSymbol = symbol?.trim() || "?";

  const dimensionOptions = UNIT_DIMENSIONS.map((value) => ({ id: value, value, label: t(`dimensions.${value}`) }));
  const booleanOptions = [
    { id: "true", value: "true", label: tCommon("yes") },
    { id: "false", value: "false", label: tCommon("no") },
  ];

  const submit = (values: UnitFormValues) =>
    onSubmit({ ...values, code: values.code?.trim() || deriveCode(values.symbol || values.name) });

  return (
    <form onSubmit={handleSubmit(submit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <FormField controller={{ control, name: "name" }} label={t("fields.name")} placeholder={t("namePlaceholder")} className='col-span-12 sm:col-span-6' />
        <FormField controller={{ control, name: "symbol" }} label={t("fields.symbol")} placeholder='ml' className='col-span-6 sm:col-span-3' />
        <FormField
          controller={{ control, name: "code" }}
          label={t("fields.code")}
          placeholder={deriveCode(symbol || name || "") || "ml"}
          description={code ? undefined : t("codeHint")}
          className='col-span-6 sm:col-span-3'
        />
        <FormSelectField
          controller={{ control, name: "dimension" }}
          label={t("fields.dimension")}
          description={inUse ? t("dimensionLocked") : t(`dimensionHints.${(dimension || "OTHER") as "OTHER"}`)}
          data={dimensionOptions}
          disabled={inUse}
          triggerClassName='!w-full'
          className='col-span-12 sm:col-span-6'
        />
        <FormField
          controller={{ control, name: "decimals" }}
          type='number'
          step='1'
          min={0}
          max={6}
          label={t("fields.decimals")}
          description={t("decimalsHint")}
          className='col-span-6 sm:col-span-3'
        />
        <FormSelectField
          controller={{ control, name: "active" }}
          label={t("fields.active")}
          data={booleanOptions}
          triggerClassName='!w-full'
          className='col-span-6 sm:col-span-3'
        />
      </div>

      {dimension !== "OTHER" ? (
        <section className='grid gap-4 rounded-xl border border-border bg-muted/20 p-4'>
          <div className='flex items-start gap-2'>
            <HiOutlineArrowsRightLeft className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground' aria-hidden='true' />
            <div>
              <h3 className='text-sm font-semibold text-foreground'>{t("conversion")}</h3>
              <p className='text-sm text-muted-foreground'>
                {firstOfDimension ? t("firstOfDimension") : t("conversionHint", { base: base?.symbol ?? "" })}
              </p>
            </div>
          </div>

          {!firstOfDimension ? (
            <div className='grid grid-cols-12 items-end gap-4'>
              <FormSelectField
                controller={{ control, name: "base" }}
                label={t("fields.base")}
                description={t("baseHint")}
                data={booleanOptions}
                triggerClassName='!w-full'
                className='col-span-12 sm:col-span-4'
              />
              <div className='col-span-12 sm:col-span-8'>
                <FormField
                  controller={{ control, name: "factor" }}
                  type='number'
                  step='any'
                  min={0}
                  label={t("factorLabel", { symbol: shownSymbol, base: base?.symbol ?? "" })}
                  placeholder='0.001'
                />
              </div>
            </div>
          ) : null}

          {!firstOfDimension && factor > 0 ? (
            <p className='rounded-lg bg-background px-3 py-2 text-sm'>
              <strong>1 {shownSymbol}</strong> = {formatQuantity(factor, { symbol: base?.symbol, decimals: 10 })} ·{" "}
              <strong>1 {base?.symbol}</strong> = {formatQuantity(1 / factor, { symbol: shownSymbol, decimals: 10 })}
              {becomesBase ? <span className='block text-xs text-muted-foreground'>{t("rebaseNotice", { base: base?.symbol ?? "" })}</span> : null}
            </p>
          ) : null}
        </section>
      ) : (
        <p className='flex gap-2 rounded-xl border border-border bg-muted/20 p-3 text-sm text-muted-foreground'>
          <HiOutlineInformationCircle className='mt-0.5 h-4 w-4 shrink-0' aria-hidden='true' />
          {t("otherHint")}
        </p>
      )}

      <div className='flex justify-end'>
        <Buttons type='submit' loading={isSubmitting} className='rounded-full'>
          {tCommon("save")}
        </Buttons>
      </div>
    </form>
  );
};
