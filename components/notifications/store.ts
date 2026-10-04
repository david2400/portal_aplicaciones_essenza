/** @format */

/**
 * Almacén mínimo (sin dependencias) para notificaciones y confirmaciones.
 * Se usa con `useSyncExternalStore`; las funciones `notify` y `confirm`
 * pueden llamarse desde cualquier componente cliente o handler.
 */

export type ToastTone = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
  /** ms antes de cerrarse sola; 0 = permanece hasta cerrarla. */
  duration: number;
}

export interface ConfirmRequest {
  id: number;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  /** Si existe, el diálogo pide un texto (ver `prompt`). */
  input?: {
    label: string;
    multiline?: boolean;
    required?: boolean;
    defaultValue?: string;
    placeholder?: string;
    /** Si existe, se muestra un selector con estas opciones en vez de un campo de texto. */
    options?: { value: string; label: string }[];
  };
  resolve: (value: boolean | string) => void;
}

type Listener = () => void;

function createStore<T>(initial: T) {
  let state = initial;
  const listeners = new Set<Listener>();
  return {
    get: () => state,
    set: (next: T) => {
      state = next;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener: Listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

let sequence = 0;
const MAX_TOASTS = 4;

export const toastStore = createStore<ToastItem[]>([]);
export const confirmStore = createStore<ConfirmRequest | null>(null);

export const dismissToast = (id: number) => toastStore.set(toastStore.get().filter((toast) => toast.id !== id));

function push(tone: ToastTone, title: string, description?: string, duration?: number) {
  const item: ToastItem = {
    id: ++sequence,
    tone,
    title,
    description,
    duration: duration ?? (tone === "error" ? 7000 : 4000),
  };
  toastStore.set([...toastStore.get(), item].slice(-MAX_TOASTS));
  return item.id;
}

/** Notificaciones no bloqueantes. */
export const notify = {
  success: (title: string, description?: string) => push("success", title, description),
  error: (title: string, description?: string) => push("error", title, description),
  info: (title: string, description?: string) => push("info", title, description),
  warning: (title: string, description?: string) => push("warning", title, description),
};

/**
 * Diálogo de confirmación accesible que devuelve una promesa.
 * `if (await confirm({ title, tone: "danger" })) { … }`
 */
export function confirm(options: Omit<ConfirmRequest, "id" | "resolve" | "input">): Promise<boolean> {
  // Una confirmación pendiente se resuelve como cancelada antes de abrir otra.
  confirmStore.get()?.resolve(false);
  return new Promise<boolean>((resolve) => {
    confirmStore.set({ ...options, id: ++sequence, resolve: (value) => resolve(value !== false) });
  });
}

/**
 * Diálogo que pide un texto (p. ej. motivo de rechazo). Devuelve el texto
 * recortado o `null` si se cancela.
 */
export function prompt(
  options: Omit<ConfirmRequest, "id" | "resolve" | "input"> & { input: NonNullable<ConfirmRequest["input"]> },
): Promise<string | null> {
  confirmStore.get()?.resolve(false);
  return new Promise<string | null>((resolve) => {
    confirmStore.set({
      ...options,
      id: ++sequence,
      resolve: (value) => resolve(typeof value === "string" ? value : null),
    });
  });
}
