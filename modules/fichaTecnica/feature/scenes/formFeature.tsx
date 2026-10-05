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

export type FeatureFormOptions = Partial<Record<string, ISelectOption[]>>;

export const FormFeature = ({
  initialValues,
  validationSchema,
  onSubmit,
  options = {},
}: IFormProps<any> & { options?: FeatureFormOptions }) => {
  const t = useTranslations("Administre.feature");
  const tCommon = useTranslations("Administre.common");
  type FeatureInputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FeatureInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <FormField
          controller={{ control, name: "name" }}
          label={t("fields.name")}
          className='col-span-12 md:col-span-6'
        />

        <FormSelectField
          controller={{ control, name: "unitId" }}
          label={t("fields.unitId")}
          data={options.units ?? []}
          placeholder={tCommon("selectPlaceholder")}
          triggerClassName='!w-full'
          className='col-span-12 md:col-span-6'
        />
      </div>
      <Buttons type='submit' loading={isSubmitting} className='w-full rounded-full'>
        {tCommon("save")}
      </Buttons>
    </form>
  );
};
