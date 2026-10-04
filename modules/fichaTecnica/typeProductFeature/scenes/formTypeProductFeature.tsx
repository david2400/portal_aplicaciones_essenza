/** @format */

"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormSelectField } from "@repo/ui/form/scenes/form-select";
import { Buttons } from "@repo/ui/buttons/scenes/index";
import type { IFormProps } from "@repo/ui/form/models/form.interface";
import type { ISelectOption } from "@repo/ui/form/models";

export const FormTypeProductFeature = ({
  initialValues,
  validationSchema,
  onSubmit,
  typeProducts,
  features,
  lockTypeProduct,
}: IFormProps<any> & {
  typeProducts: ISelectOption[];
  features: ISelectOption[];
  lockTypeProduct?: boolean;
}) => {
  const t = useTranslations("Administre.typeProductFeature");
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
          controller={{ control, name: "typeProductId" }}
          label={t("fields.typeProductId")}
          data={typeProducts}
          placeholder={tCommon("selectPlaceholder")}
          disabled={lockTypeProduct}
          triggerClassName='!w-full'
          className='col-span-12 md:col-span-6'
        />
        <FormSelectField
          controller={{ control, name: "featureId" }}
          label={t("fields.featureId")}
          data={features}
          placeholder={tCommon("selectPlaceholder")}
          searchable
          triggerClassName='!w-full'
          className='col-span-12 md:col-span-6'
        />
      </div>
      <Buttons type='submit' loading={isSubmitting} className='w-full'>
        {tCommon("save")}
      </Buttons>
    </form>
  );
};
