/** @format */

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | boolean | null | undefined;
}

const escape = (value: unknown) => {
  if (value == null) return "";
  const text = String(value);
  // Evita inyección de fórmulas al abrir el CSV en Excel/Sheets.
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return /[",;\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

/**
 * Genera un CSV compatible con Excel (BOM UTF-8 para tildes, separador `;`
 * que es el que Excel espera con configuración regional es-CO/es-ES).
 */
export function toCsv<T>(rows: T[], columns: CsvColumn<T>[], separator = ";"): string {
  const header = columns.map((column) => escape(column.header)).join(separator);
  const body = rows.map((row) => columns.map((column) => escape(column.value(row))).join(separator));
  return "﻿" + [header, ...body].join("\r\n");
}

/** Descarga un texto como archivo desde el navegador. */
export function downloadText(content: string, fileName: string, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** `marcas-2026-10-04.csv` */
export const datedFileName = (base: string, extension = "csv") =>
  `${base}-${new Date().toISOString().slice(0, 10)}.${extension}`;
