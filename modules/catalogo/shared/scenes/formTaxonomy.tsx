/** @format */

"use client";

import { useTranslations } from "next-intl";
import { useForm, useWatch, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { FormField } from "@repo/ui/form/scenes/form-field";
import { FormTextAreaField } from "@repo/ui/form/scenes/form-area";
import { FormSelectField } from "@repo/ui/form/scenes/form-select";
import { Buttons } from "@repo/ui/buttons/scenes/index";
import { HiOutlineSparkles } from "react-icons/hi2";
import type { ActionResult } from "@/shared/models/pagination";
import { TAXONOMY_LIMITS } from "../schemas/taxonomy.schema";
import { slugify } from "../utils";

export interface TaxonomyFormScene {
  /** Namespace de textos del recurso, p. ej. `Administre.brand`. */
  namespace: string;
  initialValues: Record<string, unknown>;
  validationSchema: z.ZodTypeAny;
  /** Devuelve el resultado para poder marcar errores del backend en los campos. */
  onSubmit: (values: any) => Promise<ActionResult<unknown>>;
  onCancel?: () => void;
  /** Opciones de categoría (solo subcategorías). */
  categoryOptions?: Array<{ id: string; value: string; label: string }>;
}

const Counter = ({ value, max }: { value?: string; max: number }) => {
  const length = value?.length ?? 0;
  return (
    <span className={`text-xs tabular-nums ${length > max ? "text-destructive" : "text-muted-foreground"}`}>
      {length}/{max}
    </span>
  );
};

/**
 * Formulario común de marca / categoría / subcategoría.
 *
 * - El slug es opcional: si queda vacío lo genera el backend desde el
 *   nombre; se muestra la vista previa y un botón para rellenarlo.
 * - Los errores del backend (nombre o slug repetido, validación) se pintan
 *   en el campo correspondiente en vez de un mensaje genérico.
 */
export const FormTaxonomy = ({
  namespace,
  initialValues,
  validationSchema,
  onSubmit,
  onCancel,
  categoryOptions,
}: TaxonomyFormScene) => {
  const t = useTranslations(namespace);
  const tForm = useTranslations("Administre.taxonomy");
  const tCommon = useTranslations("Administre.common");
  type Inputs = Record<string, any>;

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { isSubmitting, isDirty },
  } = useForm<Inputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  const [name, slug, description] = useWatch({ control, name: ["name", "slug", "description"] }) as [
    string,
    string,
    string,
  ];
  const generated = slugify(name ?? "");

  const submit = async (values: Inputs) => {
    const result = await onSubmit(values);
    if (!result.success && result.fieldErrors) {
      for (const [field, message] of Object.entries(result.fieldErrors)) {
        setError(field as Path<Inputs>, { type: "server", message });
      }
    } else if (!result.success && /slug/i.test(result.error)) {
      setError("slug", { type: "server", message: result.error });
    } else if (!result.success && /nombre|name/i.test(result.error)) {
      setError("name", { type: "server", message: result.error });
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className='space-y-6' noValidate>
      <div className='grid grid-cols-12 gap-4'>
        <div className={categoryOptions ? "col-span-12 md:col-span-6" : "col-span-12"}>
          <FormField controller={{ control, name: "name" }} label={t("fields.name")} required autoFocus />
          <div className='mt-1 flex justify-end'>
            <Counter value={name} max={TAXONOMY_LIMITS.name} />
          </div>
        </div>

        {categoryOptions ? (
          <FormSelectField
            controller={{ control, name: "categoryId" }}
            label={t("fields.categoryId")}
            data={categoryOptions}
            placeholder={tCommon("selectPlaceholder")}
            searchable
            required
            triggerClassName='!w-full'
            className='col-span-12 md:col-span-6'
          />
        ) : null}

        <div className='col-span-12'>
          <div className='flex items-end gap-2'>
            <div className='flex-1'>
              <FormField
                controller={{ control, name: "slug" }}
                label={t("fields.slug")}
                placeholder={generated || tForm("slugPlaceholder")}
                description={slug ? tForm("slugCustom") : generated ? tForm("slugAuto", { slug: generated }) : tForm("slugHint")}
              />
            </div>
            <Buttons
              type='button'
              variant='outline'
              size='icon'
              disabled={!generated || generated === slug}
              onClick={() => setValue("slug", generated, { shouldDirty: true, shouldValidate: true })}
              aria-label={tForm("generateSlug")}
              title={tForm("generateSlug")}>
              <HiOutlineSparkles className='h-4 w-4' aria-hidden='true' />
            </Buttons>
          </div>
        </div>

        <div className='col-span-12'>
          <FormTextAreaField
            controller={{ control, name: "description" }}
            label={t("fields.description")}
            rows={4}
            placeholder={tForm("descriptionPlaceholder")}
          />
          <div className='mt-1 flex justify-end'>
            <Counter value={description} max={TAXONOMY_LIMITS.description} />
          </div>
        </div>
      </div>

      <div className='flex flex-col-reverse gap-2 border-t border-border/70 pt-4 sm:flex-row sm:justify-end'>
        {onCancel ? (
          <Buttons type='button' variant='outline' onClick={onCancel} disabled={isSubmitting}>
            {tCommon("cancel")}
          </Buttons>
        ) : null}
        <Buttons type='submit' loading={isSubmitting} disabled={!isDirty && !!initialValues.name}>
          {tCommon("save")}
        </Buttons>
      </div>
    </form>
  );
};
