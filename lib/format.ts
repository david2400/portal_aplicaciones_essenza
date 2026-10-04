/** @format */

/**
 * Formateadores comunes. Zona horaria fija (Bogotá) para que servidor y
 * navegador produzcan el mismo texto y no haya errores de hidratación.
 */

const money = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const number = new Intl.NumberFormat("es-CO");
const dateTime = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Bogota" });
const dateOnly = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeZone: "America/Bogota" });

export const formatMoney = (value?: number | null) => (value == null ? "—" : money.format(value));
export const formatNumber = (value?: number | null) => (value == null ? "—" : number.format(value));

/** Acepta "yyyy-MM-dd HH:mm:ss" (auditoría del backend, UTC), ISO o LocalDateTime. */
export const parseApiDate = (value?: string | null) => {
  if (!value) return null;
  const iso = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(value) ? `${value.replace(" ", "T")}Z` : value;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatApiDate = (value?: string | null) => {
  const date = parseApiDate(value);
  return date ? dateTime.format(date) : "—";
};

/** `LocalDate` (yyyy-MM-dd) sin desfase de zona horaria. */
export const formatLocalDate = (value?: string | null) => {
  if (!value) return "—";
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return value;
  return dateOnly.format(new Date(Date.UTC(y, m - 1, d, 12)));
};

export const createdWithin = (value: string | null | undefined, days: number, now = Date.now()) => {
  const date = parseApiDate(value);
  return date ? now - date.getTime() <= days * 86_400_000 : false;
};
