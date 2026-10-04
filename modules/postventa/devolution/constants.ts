/** @format */

/**
 * Estados de una devolución.
 *
 * El backend guarda `state` como un único carácter (`length = 1`, valor por
 * defecto `"P"`), así que el flujo y sus códigos viven aquí:
 *
 *   P (pendiente) ──► A (aprobada) ──► R (recibida) ──► I (inspeccionada) ──► F (reembolsada)
 *        └─────────► X (rechazada)
 */
export const DEVOLUTION_STATES = ["P", "A", "R", "I", "F", "X"] as const;

export type DevolutionState = (typeof DEVOLUTION_STATES)[number];

export const DEVOLUTION_STATE_VARIANT: Record<
  DevolutionState,
  "default" | "secondary" | "destructive" | "outline"
> = {
  P: "outline",
  A: "secondary",
  R: "secondary",
  I: "secondary",
  F: "default",
  X: "destructive",
};

/** Transiciones permitidas desde cada estado. */
export const DEVOLUTION_NEXT: Record<DevolutionState, DevolutionState[]> = {
  P: ["A", "X"],
  A: ["R", "X"],
  R: ["I"],
  I: ["F"],
  F: [],
  X: [],
};

export const isDevolutionState = (value?: string): value is DevolutionState =>
  !!value && (DEVOLUTION_STATES as readonly string[]).includes(value);

export const DETAIL_CONDITIONS = ["NEW", "OPENED", "DAMAGED", "DEFECTIVE"] as const;
export const EVIDENCE_TYPES = ["PHOTO", "VIDEO", "DOCUMENT", "OTHER"] as const;

const moneyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export const formatMoney = (value?: number) =>
  value == null ? "—" : moneyFormatter.format(value);

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
});

export const formatDateTime = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
};

/** Fecha local en formato `LocalDateTime` de Java (sin zona horaria). */
export const nowLocalDateTime = () => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
    `T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  );
};

/** Monto a reembolsar de una línea: cantidad × precio − cargo de reposición. */
export const computeRefund = (quantity: number, unitPrice: number, restockingFee: number) =>
  Math.max((Number(quantity) || 0) * (Number(unitPrice) || 0) - (Number(restockingFee) || 0), 0);
