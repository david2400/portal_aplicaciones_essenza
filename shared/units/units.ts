/** @format */

/**
 * Unidades de medida en el cliente: el backend (`/catalog/units`) define el factor de cada
 * unidad respecto a la base de su magnitud; aquí se convierte y se formatea sin llamadas.
 */

export const UNIT_DIMENSIONS = ["LENGTH", "MASS", "VOLUME", "AREA", "COUNT", "OTHER"] as const;
export type UnitDimension = (typeof UNIT_DIMENSIONS)[number];

export interface IUnit {
  id?: number;
  code?: string;
  symbol?: string;
  name?: string;
  dimension?: string;
  factor?: number;
  base?: boolean;
  base_symbol?: string;
  decimals?: number;
  active?: boolean;
  usage_count?: number;
}

/** Unidades en las que se guardan las medidas del producto en el backend. */
export const STORAGE_UNIT = { length: "cm", weight: "kg" } as const;

export const unitByCode = (units: IUnit[], code?: string | null) => units.find((unit) => unit.code === code);
export const unitById = (units: IUnit[], id?: number | string | null) =>
  id == null || id === "" ? undefined : units.find((unit) => String(unit.id) === String(id));

export const unitsOf = (units: IUnit[], ...dimensions: UnitDimension[]) =>
  units.filter((unit) => unit.dimension != null && (dimensions as string[]).includes(unit.dimension));

/** Convierte entre unidades de la misma magnitud; `null` si no se puede. */
export function convertUnit(value: number, from?: IUnit, to?: IUnit): number | null {
  if (!from || !to || !Number.isFinite(value)) return null;
  if (from.code === to.code) return value;
  if (from.dimension !== to.dimension || from.dimension === "OTHER") return null;
  const a = Number(from.factor);
  const b = Number(to.factor);
  if (!(a > 0) || !(b > 0)) return null;
  // Redondeo a 10 decimales para evitar 0.30000000000000004.
  return Math.round(((value * a) / b) * 1e10) / 1e10;
}

/** Redondea al número de decimales de la unidad (o `digits`). */
export const roundTo = (value: number, digits: number) => {
  const p = 10 ** Math.max(0, Math.min(digits, 10));
  return Math.round(value * p) / p;
};

export function formatQuantity(value: number | null | undefined, unit?: IUnit, digits?: number) {
  if (value == null || !Number.isFinite(value)) return "—";
  const decimals = digits ?? (Math.abs(value) < 1 && value !== 0 ? 6 : (unit?.decimals ?? 2));
  const text = new Intl.NumberFormat("es-CO", { maximumFractionDigits: decimals }).format(value);
  return unit?.symbol ? `${text} ${unit.symbol}` : text;
}

/** Etiqueta corta para selects: "ml · Mililitro". */
export const unitLabel = (unit: IUnit) =>
  unit.symbol && unit.name && unit.symbol !== unit.name ? `${unit.symbol} · ${unit.name}` : (unit.name ?? unit.symbol ?? `#${unit.id}`);
