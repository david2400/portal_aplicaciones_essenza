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

export const FormProductFeature = ({
  initialValues,
  validationSchema,
  onSubmit,
  products,
  features,
  lockKeys,
}: IFormProps<any> & { products: ISelectOption[]; features: ISelectOption[]; lockKeys?: boolean }) => {
  const t = useTranslations("Administre.productFeature");
  const tCommon = useTranslations("Administre.common");
  type Inputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<Inputs>({ resolver: zodResolver(validationSchema), defaultValues: initialValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <FormSelectField
          controller={{ control, name: "productId" }}
          label={t("fields.productId")}
          data={products}
          placeholder={tCommon("selectPlaceholder")}
          searchable
          disabled={lockKeys}
          triggerClassName='!w-full'
          className='col-span-12'
        />
        <FormSelectField
          controller={{ control, name: "featureId" }}
          label={t("fields.featureId")}
          data={features}
          placeholder={tCommon("selectPlaceholder")}
          searchable
          disabled={lockKeys}
          triggerClassName='!w-full'
          className='col-span-12 md:col-span-8'
        />
        <FormField
          controller={{ control, name: "value" }}
          type='number'
          step='any'
          label={t("fields.value")}
          className='col-span-12 md:col-span-4'
        />
      </div>
      <Buttons type='submit' loading={isSubmitting} className='w-full rounded-full'>
        {tCommon("save")}
      </Buttons>
    </form>
  );
};
