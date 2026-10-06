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

export type CarrierFormOptions = Partial<Record<string, ISelectOption[]>>;

export const FormCarrier = ({
  initialValues,
  validationSchema,
  onSubmit,
  options = {},
}: IFormProps<any> & { options?: CarrierFormOptions }) => {
  const t = useTranslations("Administre.carrier");
  const tCommon = useTranslations("Administre.common");
  type CarrierInputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CarrierInputs>({
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

        <FormField
          controller={{ control, name: "contact_email" }}
          label={t("fields.contactEmail")}
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "contact_phone" }}
          label={t("fields.contactPhone")}
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "website" }}
          label={t("fields.website")}
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "base_rate" }}
          type='number'
          step='0.01'
          min={0}
          label={t("fields.baseRate")}
          className='col-span-12 sm:col-span-6 md:col-span-3'
        />

        <FormField
          controller={{ control, name: "rate_per_km" }}
          type='number'
          step='0.01'
          min={0}
          label={t("fields.ratePerKm")}
          className='col-span-12 sm:col-span-6 md:col-span-3'
        />

        <FormField
          controller={{ control, name: "max_delivery_days" }}
          type='number'
          step='1'
          min={0}
          label={t("fields.maxDeliveryDays")}
          className='col-span-12 sm:col-span-6 md:col-span-3'
        />

        <FormSelectField
          controller={{ control, name: "is_active" }}
          label={t("fields.isActive")}
          data={booleanOptions}
          triggerClassName='!w-full'
          className='col-span-12 sm:col-span-6 md:col-span-3'
        />
      </div>
      <Buttons type='submit' loading={isSubmitting} className='w-full rounded-full'>
        {tCommon("save")}
      </Buttons>
    </form>
  );
};
