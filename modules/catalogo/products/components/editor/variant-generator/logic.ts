/** @format */

/**
 * Lógica pura del generador de variantes: combinaciones, claves, nombres y códigos sugeridos.
 * Replica las reglas del backend (VariantPlanner / VariantCodes) para la vista previa.
 */

export interface GenOption {
  id: number;
  value: string;
}

export interface GenAxis {
  attributeId: number;
  name: string;
  fromTemplate: boolean;
  imageAxis: boolean;
  options: GenOption[];
  selected: number[];
}

/** Valores de una variante: atributo → opción. */
export type Combination = Record<number, number>;

export const MAX_AXES = 4;
export const MAX_VARIANTS = 300;

/** Clave estable de una combinación restringida a los ejes ("13:9|14:11"); null si falta un eje. */
export const keyOf = (axes: GenAxis[], combination: Combination): string | null => {
  const parts: string[] = [];
  for (const axis of [...axes].sort((a, b) => a.attributeId - b.attributeId)) {
    const option = combination[axis.attributeId];
    if (option == null) return null;
    parts.push(`${axis.attributeId}:${option}`);
  }
  return parts.join("|");
};

/** Producto cartesiano de los valores elegidos, en el orden de los ejes y de los valores. */
export const combinationsOf = (axes: GenAxis[]): Combination[] => {
  if (axes.length === 0 || axes.some((axis) => axis.selected.length === 0)) return [];
  let result: Combination[] = [{}];
  for (const axis of axes) {
    const ordered = axis.options.filter((option) => axis.selected.includes(option.id));
    const next: Combination[] = [];
    for (const partial of result) {
      for (const option of ordered) next.push({ ...partial, [axis.attributeId]: option.id });
      if (next.length > MAX_VARIANTS * 4) break;
    }
    result = next;
  }
  return result;
};

export const valueOf = (axes: GenAxis[], attributeId: number, optionId: number) =>
  axes.find((axis) => axis.attributeId === attributeId)?.options.find((option) => option.id === optionId)?.value ?? `#${optionId}`;

/** "Rojo / M" en el orden de los ejes. */
export const nameOf = (axes: GenAxis[], combination: Combination) =>
  axes
    .filter((axis) => combination[axis.attributeId] != null)
    .map((axis) => valueOf(axes, axis.attributeId, combination[axis.attributeId]!))
    .join(" / ");

const clean = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

/** Abreviatura de un valor: cortos o con números completos (M, XL, 50ML); el resto, 3 letras (ROJ). */
export const abbreviation = (value: string) => {
  const c = clean(value);
  if (!c) return "X";
  if (c.length <= 4 || /\d/.test(c)) return c.slice(0, 8);
  return c.slice(0, 3);
};

export const normalizeCode = (code: string) => code.trim().toUpperCase().replace(/\s+/g, "-");

export const SKU_CODE = /^[A-Z0-9][A-Z0-9._-]{1,63}$/;
export const BARCODE = /^[0-9A-Za-z-]{4,32}$/;

/** Código sugerido: base + abreviaturas de los valores (SKU-000003-ROJ-M). */
export const suggestCode = (base: string, axes: GenAxis[], combination: Combination) => {
  const parts = [normalizeCode(base)];
  for (const axis of axes) {
    const option = combination[axis.attributeId];
    if (option != null) parts.push(abbreviation(valueOf(axes, axis.attributeId, option)));
  }
  return parts.join("-").slice(0, 64);
};

/** Precio con ajuste porcentual y redondeo opcional hacia arriba (a 100, 1000…). */
export const adjustPrice = (price: number, percent: number, roundTo: number) => {
  const raw = price * (1 + percent / 100);
  return roundTo > 0 ? Math.ceil(raw / roundTo) * roundTo : Math.round(raw * 100) / 100;
};
