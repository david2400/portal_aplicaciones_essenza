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
import { GeoCascadeFields } from "@/components/geo-cascade-fields";

export type WarehouseFormOptions = Partial<Record<string, ISelectOption[]>>;

export const FormWarehouse = ({
  initialValues,
  validationSchema,
  onSubmit,
  options = {},
}: IFormProps<any> & { options?: WarehouseFormOptions }) => {
  const t = useTranslations("Administre.warehouse");
  const tCommon = useTranslations("Administre.common");
  type WarehouseInputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<WarehouseInputs>({
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

        <FormField
          controller={{ control, name: "code" }}
          label={t("fields.code")}
          className='col-span-12 md:col-span-6'
        />

        <GeoCascadeFields
          control={control}
          setValue={(name, value) => setValue(name as never, value as never, { shouldValidate: false })}
          initialCountryId={initialValues?.country_id}
          initialStateId={initialValues?.state_id}
        />

        <FormField
          controller={{ control, name: "address" }}
          label={t("fields.address")}
          className='col-span-12 md:col-span-9'
        />

        {/* <FormSelectField
          controller={{ control, name: "active" }}
          label={t("fields.active")}
          data={booleanOptions}
          triggerClassName='!w-full'
          className='col-span-12 sm:col-span-6 md:col-span-3'
        /> */}
      </div>
      <Buttons type='submit' loading={isSubmitting} className='w-full rounded-full'>
        {tCommon("save")}
      </Buttons>
    </form>
  );
};
