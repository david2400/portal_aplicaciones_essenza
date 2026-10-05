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
import { ORDER_STATES } from "../constants";

export const FormOrder = ({ initialValues, validationSchema, onSubmit }: IFormProps<any>) => {
  const t = useTranslations("Administre.order");
  const tCommon = useTranslations("Administre.common");
  type OrderInputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<OrderInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  const stateOptions = ORDER_STATES.map((state) => ({
    id: state,
    value: state,
    label: t(`states.${state}`),
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <FormField
          controller={{ control, name: "complementaryOrder" }}
          label={t("fields.complementaryOrder")}
          className='col-span-12 md:col-span-6'
        />

        <FormSelectField
          controller={{ control, name: "state" }}
          label={t("fields.state")}
          data={stateOptions}
          triggerClassName='!w-full'
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "total" }}
          type='number'
          step='0.01'
          min={0}
          label={t("fields.total")}
          description={t("totalHint")}
          className='col-span-12 md:col-span-6'
        />
      </div>
      <Buttons type='submit' loading={isSubmitting} className='w-full rounded-full'>
        {tCommon("save")}
      </Buttons>
    </form>
  );
};
