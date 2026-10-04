/** @format */

"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@repo/ui/form/scenes/form-field";
import { FormTextAreaField } from "@repo/ui/form/scenes/form-area";
import { FormSelectField } from "@repo/ui/form/scenes/form-select";
import { Buttons } from "@repo/ui/buttons/scenes/index";
import type { IFormProps } from "@repo/ui/form/models/form.interface";
import type { ISelectOption } from "@repo/ui/form/models";

export type ReturnMethodFormOptions = Partial<Record<string, ISelectOption[]>>;

export const FormReturnMethod = ({
  initialValues,
  validationSchema,
  onSubmit,
  options = {},
}: IFormProps<any> & { options?: ReturnMethodFormOptions }) => {
  const t = useTranslations("Administre.returnMethod");
  const tCommon = useTranslations("Administre.common");
  type ReturnMethodInputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ReturnMethodInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  const booleanOptions: ISelectOption[] = [
    { id: "true", value: "true", label: tCommon("yes") },
    { id: "false", value: "false", label: tCommon("no") },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <FormField
          controller={{ control, name: "name" }}
          label={t("fields.name")}
          className='col-span-12 md:col-span-6'
        />

        <FormSelectField
          controller={{ control, name: "active" }}
          label={t("fields.active")}
          data={booleanOptions}
          triggerClassName='!w-full'
          className='col-span-12 sm:col-span-6 md:col-span-3'
        />

        <FormTextAreaField
          controller={{ control, name: "description" }}
          label={t("fields.description")}
          className='col-span-12'
        />

        <FormTextAreaField
          controller={{ control, name: "instructions" }}
          label={t("fields.instructions")}
          className='col-span-12'
        />
      </div>
      <Buttons type='submit' loading={isSubmitting} className='w-full'>
        {tCommon("save")}
      </Buttons>
    </form>
  );
};
