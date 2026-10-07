/** @format */

"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { HiOutlineArrowsRightLeft } from "react-icons/hi2";
import { convertUnit, formatQuantity, unitByCode, UNIT_DIMENSIONS, type IUnit } from "@/shared/units/units";

const selectClass =
  "h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800";

/** Convertidor rápido entre unidades de la misma magnitud (cálculo local con los factores). */
export const UnitConverter = ({ units }: { units: IUnit[] }) => {
  const t = useTranslations("Administre.unitMeasurement");
  const usable = useMemo(() => units.filter((unit) => unit.active !== false && unit.dimension !== "OTHER"), [units]);
  const [value, setValue] = useState("1");
  const [from, setFrom] = useState(() => (unitByCode(usable, "l") ?? usable[0])?.code ?? "");
  const fromUnit = unitByCode(usable, from);
  const targets = usable.filter((unit) => unit.dimension === fromUnit?.dimension && unit.code !== from);
  const [to, setTo] = useState(() => (unitByCode(usable, "ml") ?? targets[0])?.code ?? "");
  const toUnit = unitByCode(targets, to) ?? targets[0];
  const result = convertUnit(Number(value.replace(",", ".")), fromUnit, toUnit);

  const changeFrom = (code: string) => {
    setFrom(code);
    const next = unitByCode(usable, code);
    if (toUnit?.dimension !== next?.dimension) {
      setTo(usable.find((unit) => unit.dimension === next?.dimension && unit.code !== code)?.code ?? "");
    }
  };
  const swap = () => {
    if (!toUnit) return;
    setFrom(toUnit.code ?? "");
    setTo(from);
  };

  if (usable.length < 2) return null;

  return (
    <section className='grid gap-3 rounded-xl border border-border bg-muted/20 p-4' aria-label={t("converter")}>
      <h3 className='text-sm font-semibold text-foreground'>{t("converter")}</h3>
      <div className='grid grid-cols-12 items-end gap-3'>
        <label className='col-span-12 grid gap-1 text-sm sm:col-span-3'>
          <span className='text-muted-foreground'>{t("converterValue")}</span>
          <input inputMode='decimal' value={value} onChange={(event) => setValue(event.target.value)} className={selectClass} />
        </label>
        <label className='col-span-5 grid gap-1 text-sm sm:col-span-4'>
          <span className='text-muted-foreground'>{t("converterFrom")}</span>
          <select value={from} onChange={(event) => changeFrom(event.target.value)} className={selectClass}>
            {UNIT_DIMENSIONS.filter((d) => d !== "OTHER").map((dimension) => (
              <optgroup key={dimension} label={t(`dimensions.${dimension}`)}>
                {usable
                  .filter((unit) => unit.dimension === dimension)
                  .map((unit) => (
                    <option key={unit.code} value={unit.code}>
                      {unit.symbol} · {unit.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>
        <button
          type='button'
          onClick={swap}
          aria-label={t("converterSwap")}
          className='col-span-2 flex h-10 items-center justify-center rounded-md border border-border hover:bg-muted sm:col-span-1'>
          <HiOutlineArrowsRightLeft className='h-4 w-4' aria-hidden='true' />
        </button>
        <label className='col-span-5 grid gap-1 text-sm sm:col-span-4'>
          <span className='text-muted-foreground'>{t("converterTo")}</span>
          <select value={toUnit?.code ?? ""} onChange={(event) => setTo(event.target.value)} className={selectClass}>
            {targets.map((unit) => (
              <option key={unit.code} value={unit.code}>
                {unit.symbol} · {unit.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className='text-lg font-semibold tabular-nums text-foreground' aria-live='polite'>
        {result == null ? "—" : `${formatQuantity(Number(value.replace(",", ".")), fromUnit, 6)} = ${formatQuantity(result, toUnit, 6)}`}
      </p>
    </section>
  );
};
