/** @format */

"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@repo/ui/form/scenes/form-field";
import { FormSelectField } from "@repo/ui/form/scenes/form-select";
import { Buttons } from "@repo/ui/buttons/scenes/index";
import type { IFormProps } from "@repo/ui/form/models/form.interface";
import type { ISelectOption } from "@repo/ui/form/models";

export type ComboFormOptions = Partial<Record<string, ISelectOption[]>>;

export const FormCombo = ({
  initialValues,
  validationSchema,
  onSubmit,
  options = {},
}: IFormProps<any> & { options?: ComboFormOptions }) => {
  const t = useTranslations("Administre.combo");
  const tCommon = useTranslations("Administre.common");
  type ComboInputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ComboInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <FormSelectField
          controller={{ control, name: "comboId" }}
          label={t("fields.comboId")}
          data={options.products ?? []}
          placeholder={tCommon("selectPlaceholder")}
          triggerClassName='!w-full'
          className='col-span-12 md:col-span-6'
        />

        <FormSelectField
          controller={{ control, name: "productId" }}
          label={t("fields.productId")}
          data={options.products ?? []}
          placeholder={tCommon("selectPlaceholder")}
          triggerClassName='!w-full'
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "quantity" }}
          type='number'
          step='1'
          min={0}
          label={t("fields.quantity")}
          className='col-span-12 sm:col-span-6 md:col-span-3'
        />
      </div>
      <Buttons type='submit' loading={isSubmitting} className='w-full rounded-full'>
        {tCommon("save")}
      </Buttons>
    </form>
  );
};
