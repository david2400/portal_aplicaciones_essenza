/** @format */

const dateFormatter = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });

/** Formatea `LocalDate` (YYYY-MM-DD) sin desfase de zona horaria. */
export const formatDate = (value?: string) => {
  if (!value) return "—";
  const [datePart] = value.split("T");
  const [y, m, d] = (datePart ?? "").split("-").map(Number);
  if (!y || !m || !d) return value;
  return dateFormatter.format(new Date(y, m - 1, d));
};

const dateTimeFormatter = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" });

export const formatDateTime = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateTimeFormatter.format(date);
};

/** Hoy en formato `LocalDate` (YYYY-MM-DD), en hora local. */
export const todayIso = () => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

/** Días entre hoy y una fecha `LocalDate` (negativo si ya pasó). */
export const daysFromToday = (value?: string) => {
  if (!value) return undefined;
  const [y, m, d] = value.split("T")[0]!.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  const target = new Date(y, m - 1, d).getTime();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((target - today) / 86_400_000);
};

const moneyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export const formatMoney = (value?: number) =>
  value == null ? "—" : moneyFormatter.format(value);
