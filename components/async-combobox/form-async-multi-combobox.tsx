/** @format */

"use client";

import { useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";
import { useController, type Control, type FieldValues, type Path } from "react-hook-form";
import { Label } from "@repo/ui/label/scenes/label";
import { HiOutlineXMark } from "react-icons/hi2";
import { cn } from "@/lib/utils";
import { AsyncCombobox, type ComboOption } from "./async-combobox";

export interface FormAsyncMultiComboboxProps<TValues extends FieldValues, T> {
  control: Control<TValues>;
  name: Path<TValues>;
  label?: string;
  description?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
  /** Máximo de elementos elegibles. */
  max?: number;
  search: (query: string) => Promise<ComboOption<T>[]>;
  /** Etiquetas de los valores ya guardados (una sola llamada para todos). */
  resolveMany?: (values: string[]) => Promise<ComboOption<T>[]>;
}

/**
 * Selección múltiple con búsqueda en el servidor: los elegidos se muestran como
 * etiquetas y el buscador agrega más. El campo guarda un arreglo de ids (string).
 */
export function FormAsyncMultiCombobox<TValues extends FieldValues, T = unknown>({
  control,
  name,
  label,
  description,
  placeholder,
  searchPlaceholder,
  className,
  disabled = false,
  max,
  search,
  resolveMany,
}: FormAsyncMultiComboboxProps<TValues, T>) {
  const t = useTranslations("Lookup");
  const id = `${useId()}-${String(name)}`;
  const { field, fieldState } = useController({ control, name });
  const values: string[] = Array.isArray(field.value) ? (field.value as unknown[]).map(String) : [];
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [resetKey, setResetKey] = useState(0);

  // Resuelve de una vez las etiquetas de los valores que aún no se conocen.
  const unknown = values.filter((value) => labels[value] == null);
  const unknownKey = unknown.join(",");
  useEffect(() => {
    if (!resolveMany || unknown.length === 0) return;
    let cancelled = false;
    resolveMany(unknown)
      .then((options) => {
        if (cancelled) return;
        setLabels((current) => {
          const next = { ...current };
          for (const value of unknown) next[value] = `#${value}`;
          for (const option of options) next[option.value] = option.label;
          return next;
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unknownKey]);

  const add = (option: ComboOption<T> | null) => {
    if (!option || values.includes(option.value)) return;
    setLabels((current) => ({ ...current, [option.value]: option.label }));
    field.onChange([...values, option.value]);
    setResetKey((key) => key + 1);
  };
  const remove = (value: string) => field.onChange(values.filter((item) => item !== value));

  const full = max != null && values.length >= max;
  const error = fieldState.error?.message;

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      {label ? (
        <Label htmlFor={id} className='w-full text-sm font-semibold'>
          {label}
        </Label>
      ) : null}
      {description ? <p className='w-full text-sm text-muted-foreground'>{description}</p> : null}
      {values.length > 0 ? (
        <ul className='flex flex-wrap gap-1.5' aria-label={label}>
          {values.map((value) => (
            <li
              key={value}
              className='inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-muted/40 py-0.5 pl-2.5 pr-1 text-xs'>
              <span className='truncate'>{labels[value] ?? t("loading")}</span>
              {!disabled ? (
                <button
                  type='button'
                  onClick={() => remove(value)}
                  aria-label={t("removeItem", { name: labels[value] ?? value })}
                  className='rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground'>
                  <HiOutlineXMark className='h-3.5 w-3.5' aria-hidden='true' />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      <AsyncCombobox<T>
        key={resetKey}
        id={id}
        value=''
        clearable={false}
        disabled={disabled || full}
        invalid={Boolean(error)}
        placeholder={full ? t("maxReached", { max: max ?? 0 }) : (placeholder ?? t("addPlaceholder"))}
        searchPlaceholder={searchPlaceholder}
        search={async (query) =>
          (await search(query)).map((option) => (values.includes(option.value) ? { ...option, disabled: true } : option))
        }
        onChange={(_value, option) => add(option)}
        onBlur={field.onBlur}
      />
      {error ? <span className='text-sm font-medium text-destructive'>{error}</span> : null}
    </div>
  );
}
