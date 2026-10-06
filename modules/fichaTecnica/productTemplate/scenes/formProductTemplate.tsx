/** @format */

"use client";

import { useTranslations } from "next-intl";
import { Controller, useFieldArray, useForm, useWatch, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HiOutlineArrowDown, HiOutlineArrowUp, HiOutlinePlus, HiOutlineTrash } from "react-icons/hi2";
import { FormField } from "@repo/ui/form/scenes/form-field";
import { FormSelectField } from "@repo/ui/form/scenes/form-select";
import { FormTextAreaField } from "@repo/ui/form/scenes/form-area";
import { Checkbox } from "@repo/ui/inputs/scenes/checkbox";
import { Buttons } from "@repo/ui/buttons/scenes/index";
import type { IFormProps } from "@repo/ui/form/models/form.interface";
import type { IAttributeOption } from "../models/productTemplate.interface";
import type { ProductTemplateFormValues } from "../schemas/productTemplate.schema";

type Flag = "required" | "variant_axis" | "filterable";

const FlagCheckbox = ({
  control,
  index,
  flag,
  label,
  disabled,
  onCheckedChange,
}: {
  control: Control<ProductTemplateFormValues>;
  index: number;
  flag: Flag;
  label: string;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) => (
  <Controller
    control={control}
    name={`attributes.${index}.${flag}` as const}
    render={({ field }) => (
      <label className='inline-flex items-center gap-2 text-sm'>
        <Checkbox
          checked={Boolean(field.value)}
          disabled={disabled}
          onCheckedChange={(checked) => {
            field.onChange(checked === true);
            onCheckedChange?.(checked === true);
          }}
        />
        {label}
      </label>
    )}
  />
);

export const FormProductTemplate = ({
  initialValues,
  validationSchema,
  onSubmit,
  attributes,
}: IFormProps<any> & { attributes: IAttributeOption[] }) => {
  const t = useTranslations("Administre.productTemplate");
  const tAttr = useTranslations("Administre.attribute");
  const tCommon = useTranslations("Administre.common");

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<ProductTemplateFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });
  const { fields, append, remove, move } = useFieldArray({ control, name: "attributes" });
  const rows = useWatch({ control, name: "attributes" }) ?? [];

  const byId = new Map(attributes.map((attribute) => [String(attribute.id), attribute]));
  const attributeOptions = attributes
    .filter((attribute) => attribute.id != null)
    .map((attribute) => ({
      id: String(attribute.id),
      value: String(attribute.id),
      label: `${attribute.name ?? `#${attribute.id}`} · ${tAttr(`types.${(attribute.data_type ?? "TEXT") as "TEXT"}`)}`,
    }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <FormField controller={{ control, name: "name" }} label={t("fields.name")} className='col-span-12' />
        <FormTextAreaField
          controller={{ control, name: "description" }}
          label={t("fields.description")}
          rows={2}
          className='col-span-12'
        />
      </div>

      <fieldset className='space-y-3 rounded-xl border border-border p-4'>
        <legend className='px-1 text-sm font-semibold text-foreground'>{t("fields.attributes")}</legend>
        <p className='text-xs text-muted-foreground'>{t("attributesHint")}</p>
        {fields.length === 0 ? <p className='text-sm text-muted-foreground'>{t("noAttributes")}</p> : null}
        <ol className='space-y-3'>
          {fields.map((field, index) => {
            const selected = byId.get(String(rows[index]?.attribute_id ?? ""));
            const isOption = selected?.data_type === "OPTION";
            const isAxis = Boolean(rows[index]?.variant_axis);
            return (
              <li key={field.id} className='rounded-lg border border-border/70 p-3'>
                <div className='flex items-start gap-2'>
                  <FormSelectField
                    controller={{ control, name: `attributes.${index}.attribute_id` as const }}
                    label={t("attributeLabel", { index: index + 1 })}
                    data={attributeOptions}
                    placeholder={tCommon("selectPlaceholder")}
                    searchable={true}
                    triggerClassName='!w-full'
                    className='flex-1'
                  />
                  <div className='mt-6 flex gap-1'>
                    <Buttons
                      type='button'
                      variant='ghost'
                      size='icon'
                      disabled={index === 0}
                      aria-label={t("moveUp")}
                      onClick={() => move(index, index - 1)}>
                      <HiOutlineArrowUp className='h-4 w-4' aria-hidden='true' />
                    </Buttons>
                    <Buttons
                      type='button'
                      variant='ghost'
                      size='icon'
                      disabled={index === fields.length - 1}
                      aria-label={t("moveDown")}
                      onClick={() => move(index, index + 1)}>
                      <HiOutlineArrowDown className='h-4 w-4' aria-hidden='true' />
                    </Buttons>
                    <Buttons
                      type='button'
                      variant='ghost'
                      size='icon'
                      aria-label={t("removeAttribute", { index: index + 1 })}
                      onClick={() => remove(index)}>
                      <HiOutlineTrash className='h-4 w-4' aria-hidden='true' />
                    </Buttons>
                  </div>
                </div>
                <div className='mt-2 flex flex-wrap gap-x-6 gap-y-2'>
                  <FlagCheckbox
                    control={control}
                    index={index}
                    flag='variant_axis'
                    label={t("fields.variantAxis")}
                    disabled={!isOption}
                    onCheckedChange={(checked) => {
                      // Un eje se exige en cada variante: no se marca como obligatorio de ficha.
                      if (checked) setValue(`attributes.${index}.required` as const, false);
                    }}
                  />
                  <FlagCheckbox
                    control={control}
                    index={index}
                    flag='required'
                    label={t("fields.required")}
                    disabled={isAxis}
                  />
                  <FlagCheckbox control={control} index={index} flag='filterable' label={t("fields.filterable")} />
                </div>
                {!isOption && selected ? <p className='mt-1 text-xs text-muted-foreground'>{t("axisHint")}</p> : null}
              </li>
            );
          })}
        </ol>
        <Buttons
          type='button'
          variant='outline'
          className='rounded-full'
          onClick={() => append({ attribute_id: undefined as unknown as number, required: false, variant_axis: false, filterable: true })}>
          <HiOutlinePlus className='mr-1 h-4 w-4' aria-hidden='true' />
          {t("addAttribute")}
        </Buttons>
      </fieldset>

      <Buttons type='submit' loading={isSubmitting} className='w-full rounded-full'>
        {tCommon("save")}
      </Buttons>
    </form>
  );
};
