/** @format */

"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@repo/ui/form/scenes/form-field";
import { FormSelectField } from "@repo/ui/form/scenes/form-select";
import { Buttons } from "@repo/ui/buttons/scenes/index";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import type { IFormProps } from "@repo/ui/form/models/form.interface";
import type { IDispatchCarrier } from "../models/dispatch.interface";

export const FormShippingQuote = ({
  initialValues,
  validationSchema,
  onSubmit,
  carriers,
}: IFormProps<any> & { carriers: IDispatchCarrier[] }) => {
  const t = useTranslations("Administre.dispatch.quote");
  const tCommon = useTranslations("Administre.common");
  type QuoteInputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<QuoteInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  const carrierOptions = useMemo(
    () =>
      carriers
        .filter((carrier) => !!carrier.code)
        .map((carrier) => ({
          id: carrier.code as string,
          value: carrier.code as string,
          label: `${carrier.name ?? carrier.code} (${carrier.code})`,
        })),
    [carriers],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <div className='grid grid-cols-12 gap-4'>
        <FormSelectField
          controller={{ control, name: "carrierCode" }}
          label={t("fields.carrierCode")}
          data={carrierOptions}
          placeholder={tCommon("selectPlaceholder")}
          triggerClassName='!w-full'
          className='col-span-12'
        />
        <FormField
          controller={{ control, name: "originZip" }}
          label={t("fields.originZip")}
          className='col-span-12 sm:col-span-6'
        />
        <FormField
          controller={{ control, name: "destinationZip" }}
          label={t("fields.destinationZip")}
          className='col-span-12 sm:col-span-6'
        />
        <FormField
          controller={{ control, name: "weight" }}
          type='number'
          step='0.01'
          min={0}
          label={t("fields.weight")}
          className='col-span-12 sm:col-span-6'
        />
        <FormField
          controller={{ control, name: "serviceType" }}
          label={t("fields.serviceType")}
          className='col-span-12 sm:col-span-6'
        />
      </div>
      <Buttons type='submit' variant='outline' loading={isSubmitting} className='w-full'>
        <HiOutlineMagnifyingGlass className='h-4 w-4' aria-hidden='true' />
        {t("submit")}
      </Buttons>
    </form>
  );
};
