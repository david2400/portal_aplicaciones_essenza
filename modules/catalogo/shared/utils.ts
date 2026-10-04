/** @format */

/** Igual que `Slugs.slugify` del backend: "Perfumes Árabes" → "perfumes-arabes". */
export const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

// Zona horaria fija: el mismo texto en servidor y navegador (sin errores de hidratación).
const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Bogota",
});

/** El backend envía auditoría como "yyyy-MM-dd HH:mm:ss" en UTC. */
export const parseApiDate = (value?: string | null) => {
  if (!value) return null;
  const iso = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(value) ? `${value.replace(" ", "T")}Z` : value;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatApiDate = (value?: string | null) => {
  const date = parseApiDate(value);
  return date ? dateFormatter.format(date) : "—";
};

/** Registros creados en los últimos `days` días. */
export const createdWithin = (value: string | null | undefined, days: number, now = Date.now()) => {
  const date = parseApiDate(value);
  return date ? now - date.getTime() <= days * 86_400_000 : false;
};
