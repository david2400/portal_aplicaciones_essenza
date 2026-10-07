/** @format */

"use client";

import { useId } from "react";
import { useController, type Control, type FieldValues, type Path } from "react-hook-form";
import { Label } from "@repo/ui/label/scenes/label";
import { cn } from "@/lib/utils";
import { AsyncCombobox, type AsyncComboboxProps, type ComboOption } from "./async-combobox";

export type FormAsyncComboboxProps<TValues extends FieldValues, T> = Omit<
  AsyncComboboxProps<T>,
  "value" | "onChange" | "invalid" | "id"
> & {
  control: Control<TValues>;
  name: Path<TValues>;
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
  /** Se llama con la opción completa al elegir (o null al limpiar). */
  onSelect?: (option: ComboOption<T> | null) => void;
};

/**
 * Combobox asíncrono enlazado a react-hook-form. Guarda el id como string
 * (los esquemas zod lo convierten con `z.coerce.number()`), igual que FormSelectField.
 */
export function FormAsyncCombobox<TValues extends FieldValues, T = unknown>({
  control,
  name,
  label,
  description,
  required,
  className,
  onSelect,
  ...combo
}: FormAsyncComboboxProps<TValues, T>) {
  const id = `${useId()}-${String(name)}`;
  const { field, fieldState } = useController({ control, name });
  const errorId = `${id}-error`;
  const error = fieldState.error?.message;

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      {label ? (
        <Label htmlFor={id} className='w-full text-sm font-semibold'>
          {label}
          {required ? <span className='ml-1 text-destructive'>*</span> : null}
        </Label>
      ) : null}
      {description ? <p className='w-full text-sm text-muted-foreground'>{description}</p> : null}
      <AsyncCombobox<T>
        {...combo}
        id={id}
        value={field.value as string | number | null | undefined}
        invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onBlur={field.onBlur}
        onChange={(value, option) => {
          field.onChange(value);
          onSelect?.(option);
        }}
      />
      {error ? (
        <span id={errorId} className='text-sm font-medium text-destructive'>
          {error}
        </span>
      ) : null}
    </div>
  );
}
