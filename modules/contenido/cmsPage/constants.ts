/** @format */

/** Estados de una página. El backend asigna `DRAFT` si no se envía. */
export const PAGE_STATUSES = ["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED"] as const;
export type PageStatus = (typeof PAGE_STATUSES)[number];

export const PAGE_STATUS_VARIANT: Record<PageStatus, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "outline",
  PUBLISHED: "default",
  SCHEDULED: "secondary",
  ARCHIVED: "destructive",
};

export const isPageStatus = (value?: string): value is PageStatus =>
  !!value && (PAGE_STATUSES as readonly string[]).includes(value);

/** Tipos de página documentados en `PageDto.pageType`. */
export const PAGE_TYPES = ["STATIC", "LANDING", "BLOG", "CATEGORY"] as const;
export type PageType = (typeof PAGE_TYPES)[number];

/** Límites de `CreatePageDto` (para contadores y validación). */
export const PAGE_LIMITS = {
  title: 180,
  slug: 200,
  excerpt: 255,
  metaTitle: 180,
  metaDescription: 255,
  metaKeywords: 255,
  template: 80,
  authorName: 120,
  featuredImage: 255,
} as const;

/** Longitudes recomendadas para buscadores. */
export const SEO_RECOMMENDED = { metaTitle: 60, metaDescription: 160 } as const;

/** Igual que el `slugify` del backend: minúsculas, sin tildes, guiones. */
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

/** `LocalDateTime` → valor de `<input type="datetime-local">`. */
export const toInputDateTime = (value?: string) => (value ? value.slice(0, 16) : "");

/** Valor de `<input type="datetime-local">` → `LocalDateTime`. */
export const fromInputDateTime = (value?: string) => {
  if (!value) return undefined;
  return value.length === 16 ? `${value}:00` : value;
};

/** Ahora, en formato `LocalDateTime` local. */
export const nowLocalDateTime = () => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
    `T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  );
};

const dateTimeFormatter = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" });

export const formatDateTime = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateTimeFormatter.format(date);
};
