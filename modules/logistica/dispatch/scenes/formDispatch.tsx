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
    <FormField controller={{ control, name }} label={t(`fields.${name}`)} className={span} />
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <FormSelectField
          controller={{ control, name: "orderId" }}
          label={t("fields.orderId")}
          data={orderOptions}
          placeholder={tCommon("selectPlaceholder")}
          searchable
          triggerClassName='!w-full'
          className='col-span-12 md:col-span-6'
        />
        {text("guideNumber")}
        {text("address", "col-span-12")}

        <fieldset className='col-span-12 grid grid-cols-12 gap-4 rounded-xl border border-border p-4'>
          <legend className='px-1 text-sm font-semibold text-muted-foreground'>{t("originLegend")}</legend>
          {text("departmentOrigin")}
          {text("cityOrigin")}
        </fieldset>

        <fieldset className='col-span-12 grid grid-cols-12 gap-4 rounded-xl border border-border p-4'>
          <legend className='px-1 text-sm font-semibold text-muted-foreground'>
            {t("destinationLegend")}
          </legend>
          {text("departmentDestination")}
          {text("cityDestination")}
        </fieldset>

        <FormField
          controller={{ control, name: "estimatedDeliveryDate" }}
          type='date'
          label={t("fields.estimatedDeliveryDate")}
          className='col-span-12 sm:col-span-6'
        />
        <FormField
          controller={{ control, name: "realDeliveryDate" }}
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
