/** @format */

import type { ComponentType, ReactNode } from "react";
import type { ColumnDef, RowData } from "@tanstack/react-table";

type IconType = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" }>;

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Nombre legible (selector de columnas y encabezado del CSV). */
    label?: string;
    /** Valor exportado al CSV. Sin él, la columna no se exporta. */
    exportValue?: (row: TData) => string | number | boolean | null | undefined;
    /** Alineación del contenido. */
    align?: "left" | "right" | "center";
    /** `false` impide ocultar la columna. */
    hideable?: boolean;
    /** Clases extra para las celdas. */
    className?: string;
    /** Oculta la columna por defecto (el usuario puede mostrarla). */
    defaultHidden?: boolean;
  }
}

export type GridColumn<T> = ColumnDef<T, any>;

export interface GridFilterOption {
  value: string;
  label: string;
}

/** Filtro de la barra de herramientas. `id` es también el parámetro de URL. */
export interface GridFilter<T = unknown> {
  id: string;
  label: string;
  options: GridFilterOption[];
  /** Filtros que se limpian al cambiar este (p. ej. categoría → subcategoría). */
  resets?: string[];
  /** Solo modo cliente: valor del registro con el que se compara. */
  accessor?: (row: T) => string | number | null | undefined;
}

export interface RowAction {
  label: string;
  icon?: IconType;
  onSelect: () => void;
  tone?: "default" | "danger";
  disabled?: boolean;
  /** Separador antes de esta acción. */
  separated?: boolean;
}

export interface BulkAction<T> {
  label: string;
  icon?: IconType;
  tone?: "default" | "danger";
  onAction: (rows: T[]) => void | Promise<void>;
}

export interface GridPagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface GridEmptyState {
  title: string;
  description?: string;
  action?: ReactNode;
}
