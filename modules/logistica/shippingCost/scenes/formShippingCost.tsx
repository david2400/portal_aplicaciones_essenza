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
import { HiOutlineCalculator } from "react-icons/hi2";
import type { IFormProps } from "@repo/ui/form/models/form.interface";
import type { IShippingCarrier } from "../models/shippingCost.interface";

export const FormShippingCost = ({
  initialValues,
  validationSchema,
  onSubmit,
  carriers,
}: IFormProps<any> & { carriers: IShippingCarrier[] }) => {
  const t = useTranslations("Administre.shippingCost");
  const tCommon = useTranslations("Administre.common");
  type ShippingCostInputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ShippingCostInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  const carrierOptions = useMemo(
    () =>
      carriers
        .filter((carrier) => carrier.id != null && carrier.isActive !== false)
        .map((carrier) => ({
          id: String(carrier.id),
          value: String(carrier.id),
          label: carrier.name ?? `#${carrier.id}`,
        })),
    [carriers],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <div className='grid grid-cols-12 gap-4'>
        <FormSelectField
          controller={{ control, name: "carrierId" }}
          label={t("fields.carrierId")}
          data={carrierOptions}
          placeholder={tCommon("selectPlaceholder")}
          triggerClassName='!w-full'
          className='col-span-12'
        />
        <FormField
          controller={{ control, name: "originAddress" }}
          label={t("fields.originAddress")}
          className='col-span-12 md:col-span-6'
        />
        <FormField
          controller={{ control, name: "destinationAddress" }}
          label={t("fields.destinationAddress")}
          className='col-span-12 md:col-span-6'
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
          controller={{ control, name: "volume" }}
          type='number'
          step='0.001'
          min={0}
          label={t("fields.volume")}
          className='col-span-12 sm:col-span-6'
        />
      </div>
      <Buttons type='submit' loading={isSubmitting} className='w-full rounded-full'>
        <HiOutlineCalculator className='h-4 w-4' aria-hidden='true' />
        {t("calculate")}
      </Buttons>
    </form>
  );
};
