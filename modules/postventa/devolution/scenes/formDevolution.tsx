/** @format */

"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@repo/ui/form/scenes/form-field";
import { FormTextAreaField } from "@repo/ui/form/scenes/form-area";
import { FormSelectField } from "@repo/ui/form/scenes/form-select";
import { Buttons } from "@repo/ui/buttons/scenes/index";
import type { IFormProps } from "@repo/ui/form/models/form.interface";
import type { IDevolutionCatalogs, IDevolutionOption } from "../models/devolution.interface";

const toOptions = (items: IDevolutionOption[]) =>
  items
    .filter((item) => item.id != null)
    .map((item) => ({
      id: String(item.id),
      value: String(item.id),
      label: item.name ?? `#${item.id}`,
    }));

export const FormDevolution = ({
  initialValues,
  validationSchema,
  onSubmit,
  catalogs,
}: IFormProps<any> & { catalogs: IDevolutionCatalogs }) => {
  const t = useTranslations("Administre.devolution");
  const tCommon = useTranslations("Administre.common");
  type DevolutionInputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<DevolutionInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  const options = useMemo(
    () => ({
      orders: toOptions(catalogs.orders),
      motives: toOptions(catalogs.motives),
      returnMethods: toOptions(catalogs.returnMethods),
      refundMethods: toOptions(catalogs.refundMethods),
    }),
    [catalogs],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <FormSelectField
          controller={{ control, name: "orderId" }}
          label={t("fields.orderId")}
          data={options.orders}
          placeholder={tCommon("selectPlaceholder")}
          searchable
          triggerClassName='!w-full'
          className='col-span-12 md:col-span-6'
        />

        <FormSelectField
          controller={{ control, name: "motiveDevolutionId" }}
          label={t("fields.motiveDevolutionId")}
          data={options.motives}
          placeholder={tCommon("selectPlaceholder")}
          triggerClassName='!w-full'
          className='col-span-12 md:col-span-6'
        />

        <FormSelectField
          controller={{ control, name: "returnMethodId" }}
          label={t("fields.returnMethodId")}
          data={options.returnMethods}
          placeholder={tCommon("selectPlaceholder")}
          triggerClassName='!w-full'
          className='col-span-12 md:col-span-6'
        />

        <FormSelectField
          controller={{ control, name: "refundMethodId" }}
          label={t("fields.refundMethodId")}
          data={options.refundMethods}
          placeholder={tCommon("selectPlaceholder")}
          triggerClassName='!w-full'
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "externalReference" }}
          label={t("fields.externalReference")}
          className='col-span-12 md:col-span-6'
        />

        <FormTextAreaField
          controller={{ control, name: "observation" }}
          label={t("fields.observation")}
          className='col-span-12'
        />
      </div>
      <Buttons type='submit' loading={isSubmitting} className='w-full rounded-full'>
        {tCommon("save")}
      </Buttons>
    </form>
  );
};
