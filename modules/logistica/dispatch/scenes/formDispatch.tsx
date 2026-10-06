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
import type { IFormProps } from "@repo/ui/form/models/form.interface";
import type { IDispatchOrder } from "../models/dispatch.interface";

import { fieldKey } from "@/shared/i18n/field-key";
export const FormDispatch = ({
  initialValues,
  validationSchema,
  onSubmit,
  orders,
}: IFormProps<any> & { orders: IDispatchOrder[] }) => {
  const t = useTranslations("Administre.dispatch");
  const tCommon = useTranslations("Administre.common");
  type DispatchInputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<DispatchInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  const orderOptions = useMemo(
    () =>
      orders
        .filter((order) => order.id != null)
        .map((order) => ({
          id: String(order.id),
          value: String(order.id),
          label: order.name ?? `#${order.id}`,
        })),
    [orders],
  );

  const text = (name: string, span = "col-span-12 md:col-span-6") => (
    <FormField controller={{ control, name }} label={t(fieldKey(name) as never)} className={span} />
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <FormSelectField
          controller={{ control, name: "order_id" }}
          label={t("fields.orderId")}
          data={orderOptions}
          placeholder={tCommon("selectPlaceholder")}
          searchable
          triggerClassName='!w-full'
          className='col-span-12 md:col-span-6'
        />
        {text("guide_number")}
        {text("address", "col-span-12")}

        <fieldset className='col-span-12 grid grid-cols-12 gap-4 rounded-xl border border-border p-4'>
          <legend className='px-1 text-sm font-semibold text-muted-foreground'>{t("originLegend")}</legend>
          {text("department_origin")}
          {text("city_origin")}
        </fieldset>

        <fieldset className='col-span-12 grid grid-cols-12 gap-4 rounded-xl border border-border p-4'>
          <legend className='px-1 text-sm font-semibold text-muted-foreground'>
            {t("destinationLegend")}
          </legend>
          {text("department_destination")}
          {text("city_destination")}
        </fieldset>

        <FormField
          controller={{ control, name: "estimated_delivery_date" }}
          type='date'
          label={t("fields.estimatedDeliveryDate")}
          className='col-span-12 sm:col-span-6'
        />
        <FormField
          controller={{ control, name: "real_delivery_date" }}
          type='date'
          label={t("fields.realDeliveryDate")}
          description={t("realDeliveryHint")}
          className='col-span-12 sm:col-span-6'
        />
      </div>
      <Buttons type='submit' loading={isSubmitting} className='w-full rounded-full'>
        {tCommon("save")}
      </Buttons>
    </form>
  );
};
