/** @format */

"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi2";
import { FormField } from "@repo/ui/form/scenes/form-field";
import { FormSelectField } from "@repo/ui/form/scenes/form-select";
import { FormTextAreaField } from "@repo/ui/form/scenes/form-area";
import { Buttons } from "@repo/ui/buttons/scenes/index";
import type { IFormProps } from "@repo/ui/form/models/form.interface";
import { ATTRIBUTE_DATA_TYPES, codeFromName, type INamedItem } from "../models/attribute.interface";
import type { AttributeFormValues } from "../schemas/attribute.schema";

const NO_UNIT = "none";

export const FormAttribute = ({
  initialValues,
  validationSchema,
  onSubmit,
  units,
  inUse = false,
  isNew = false,
}: IFormProps<any> & { units: INamedItem[]; inUse?: boolean; isNew?: boolean }) => {
  const t = useTranslations("Administre.attribute");
  const tCommon = useTranslations("Administre.common");

  const {
    control,
    handleSubmit,
    setValue,
    getFieldState,
    formState: { isSubmitting, errors },
  } = useForm<AttributeFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });
  const { fields, append, remove } = useFieldArray({ control, name: "options" });
  const dataType = useWatch({ control, name: "data_type" });
  const name = useWatch({ control, name: "name" });

  // Al crear, el código se propone desde el nombre mientras no se haya editado a mano.
  useEffect(() => {
    if (isNew && !getFieldState("code").isDirty && typeof name === "string") {
      setValue("code", codeFromName(name), { shouldValidate: false });
    }
  }, [isNew, name, getFieldState, setValue]);

  const typeOptions = ATTRIBUTE_DATA_TYPES.map((type) => ({ id: type, value: type, label: t(`types.${type}`) }));
  const unitOptions = [
    { id: NO_UNIT, value: NO_UNIT, label: t("noUnit") },
    ...units
      .filter((unit) => unit.id != null)
      .map((unit) => ({ id: String(unit.id), value: String(unit.id), label: unit.name ?? `#${unit.id}` })),
  ];
  const optionsError = (errors.options as { message?: string } | undefined)?.message;

  const submit = (values: AttributeFormValues) =>
    onSubmit({ ...values, unit_id: String(values.unit_id ?? "") === NO_UNIT ? undefined : values.unit_id });

  return (
    <form onSubmit={handleSubmit(submit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <FormField controller={{ control, name: "name" }} label={t("fields.name")} className='col-span-12 md:col-span-6' />
        <FormField
          controller={{ control, name: "code" }}
          label={t("fields.code")}
          description={t("codeHint")}
          className='col-span-12 md:col-span-6'
        />
        <FormSelectField
          controller={{ control, name: "data_type" }}
          label={t("fields.dataType")}
          description={inUse ? t("typeLocked") : t(`typeHints.${dataType ?? "TEXT"}`)}
          data={typeOptions}
          disabled={inUse}
          triggerClassName='!w-full'
          className='col-span-12 md:col-span-6'
        />
        <FormSelectField
          controller={{ control, name: "unit_id" }}
          label={t("fields.unitId")}
          data={unitOptions}
          searchable
          placeholder={tCommon("selectPlaceholder")}
          triggerClassName='!w-full'
          className='col-span-12 md:col-span-6'
        />
        <FormTextAreaField
          controller={{ control, name: "description" }}
          label={t("fields.description")}
          rows={2}
          className='col-span-12'
        />
      </div>

      {dataType === "OPTION" ? (
        <fieldset className='space-y-3 rounded-xl border border-border p-4'>
          <legend className='px-1 text-sm font-semibold text-foreground'>{t("fields.options")}</legend>
          <p className='text-xs text-muted-foreground'>{t("optionsHint")}</p>
          <ul className='space-y-2'>
            {fields.map((field, index) => (
              <li key={field.id} className='flex items-start gap-2'>
                <FormField
                  controller={{ control, name: `options.${index}.value` as const }}
                  label={t("optionLabel", { index: index + 1 })}
                  className='flex-1'
                />
                <Buttons
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='mt-6'
                  aria-label={t("removeOption", { index: index + 1 })}
                  onClick={() => remove(index)}>
                  <HiOutlineTrash className='h-4 w-4' aria-hidden='true' />
                </Buttons>
              </li>
            ))}
          </ul>
          {optionsError ? <p className='text-sm text-destructive'>{optionsError}</p> : null}
          <Buttons type='button' variant='outline' className='rounded-full' onClick={() => append({ value: "" })}>
            <HiOutlinePlus className='mr-1 h-4 w-4' aria-hidden='true' />
            {t("addOption")}
          </Buttons>
        </fieldset>
      ) : null}

      <Buttons type='submit' loading={isSubmitting} className='w-full rounded-full'>
        {tCommon("save")}
      </Buttons>
    </form>
  );
};
