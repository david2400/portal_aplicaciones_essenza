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
import { HiOutlineCalendarDays } from "react-icons/hi2";
import type { IFormProps } from "@repo/ui/form/models/form.interface";
import type { IDeliveryCarrier } from "../models/deliveryEstimate.interface";

export const FormDeliveryEstimate = ({
  initialValues,
  validationSchema,
  onSubmit,
  carriers,
}: IFormProps<any> & { carriers: IDeliveryCarrier[] }) => {
  const t = useTranslations("Administre.deliveryEstimate");
  const tCommon = useTranslations("Administre.common");
  type DeliveryEstimateInputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<DeliveryEstimateInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  const carrierOptions = useMemo(
    () =>
      carriers
        .filter((carrier) => carrier.id != null && carrier.is_active !== false)
        .map((carrier) => ({
          id: String(carrier.id),
          value: String(carrier.id),
          label: carrier.name ?? `#${carrier.id}`,
        })),
    [carriers],
  );

  const booleanOptions = [
    { id: "true", value: "true", label: tCommon("yes") },
    { id: "false", value: "false", label: tCommon("no") },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <div className='grid grid-cols-12 gap-4'>
        <FormSelectField
          controller={{ control, name: "carrier_id" }}
          label={t("fields.carrierId")}
          data={carrierOptions}
          placeholder={tCommon("selectPlaceholder")}
          triggerClassName='!w-full'
          className='col-span-12'
        />
        <FormField
          controller={{ control, name: "origin_address" }}
          label={t("fields.originAddress")}
          className='col-span-12 md:col-span-6'
        />
        <FormField
          controller={{ control, name: "destination_address" }}
          label={t("fields.destinationAddress")}
          className='col-span-12 md:col-span-6'
        />
        <FormField
          controller={{ control, name: "shipment_date" }}
          type='datetime-local'
          label={t("fields.shipmentDate")}
          className='col-span-12 sm:col-span-6'
        />
        <FormSelectField
          controller={{ control, name: "is_business_days_only" }}
          label={t("fields.isBusinessDaysOnly")}
          data={booleanOptions}
          triggerClassName='!w-full'
          className='col-span-12 sm:col-span-6'
        />
      </div>
      <Buttons type='submit' loading={isSubmitting} className='w-full rounded-full'>
        <HiOutlineCalendarDays className='h-4 w-4' aria-hidden='true' />
        {t("calculate")}
      </Buttons>
    </form>
  );
};
