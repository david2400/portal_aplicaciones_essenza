/** @format */

"use client";

import { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@repo/ui/form/scenes/form-field";
import { FormTextAreaField } from "@repo/ui/form/scenes/form-area";
import { FormSelectField } from "@repo/ui/form/scenes/form-select";
import { Buttons } from "@repo/ui/buttons/scenes/index";
import type { IFormProps } from "@repo/ui/form/models/form.interface";
import type { IDevolutionOrderLine } from "../models/devolution.interface";
import { DETAIL_CONDITIONS, computeRefund, formatMoney } from "../constants";

export const FormDevolutionDetail = ({
  initialValues,
  validationSchema,
  onSubmit,
  lines,
}: IFormProps<any> & { lines: IDevolutionOrderLine[] }) => {
  const t = useTranslations("Administre.devolution.details");
  const tCommon = useTranslations("Administre.common");
  type DetailInputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting, dirtyFields },
  } = useForm<DetailInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  const [productOrderId, quantity, unitPrice, restockingFee] = useWatch({
    control,
    name: ["productOrderId", "quantity", "unitPrice", "restockingFee"],
  }) as [string, number, number, number];

  const selected = lines.find((line) => String(line.id) === String(productOrderId));

  // Al elegir otra línea de la orden se propone su precio unitario.
  useEffect(() => {
    if (selected && (dirtyFields as Record<string, unknown>).productOrderId) {
      setValue("unitPrice" as never, selected.unitPrice as never);
    }
  }, [selected, dirtyFields, setValue]);

  const lineOptions = useMemo(
    () =>
      lines
        .filter((line) => line.id != null)
        .map((line) => ({
          id: String(line.id),
          value: String(line.id),
          label: `${line.productName} · ${t("purchased", { quantity: line.quantity })}`,
        })),
    [lines, t],
  );

  const conditionOptions = DETAIL_CONDITIONS.map((condition) => ({
    id: condition,
    value: condition,
    label: t(`conditions.${condition}`),
  }));

  const refund = computeRefund(quantity, unitPrice, restockingFee);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <FormSelectField
          controller={{ control, name: "productOrderId" }}
          label={t("fields.productOrderId")}
          data={lineOptions}
          placeholder={tCommon("selectPlaceholder")}
          searchable
          triggerClassName='!w-full'
          className='col-span-12 md:col-span-8'
        />

        <FormSelectField
          controller={{ control, name: "condition" }}
          label={t("fields.condition")}
          data={conditionOptions}
          triggerClassName='!w-full'
          className='col-span-12 md:col-span-4'
        />

        <FormField
          controller={{ control, name: "quantity" }}
          type='number'
          step='1'
          min={1}
          max={selected?.quantity}
          label={t("fields.quantity")}
          className='col-span-12 sm:col-span-6 md:col-span-3'
        />

        <FormField
          controller={{ control, name: "receivedQuantity" }}
          type='number'
          step='1'
          min={0}
          label={t("fields.receivedQuantity")}
          className='col-span-12 sm:col-span-6 md:col-span-3'
        />

        <FormField
          controller={{ control, name: "unitPrice" }}
          type='number'
          step='0.01'
          min={0}
          label={t("fields.unitPrice")}
          className='col-span-12 sm:col-span-6 md:col-span-3'
        />

        <FormField
          controller={{ control, name: "restockingFee" }}
          type='number'
          step='0.01'
          min={0}
          label={t("fields.restockingFee")}
          className='col-span-12 sm:col-span-6 md:col-span-3'
        />

        <FormTextAreaField
          controller={{ control, name: "observation" }}
          label={t("fields.observation")}
          className='col-span-12'
        />
      </div>

      <div className='flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4 text-sm'>
        <span className='text-muted-foreground'>{t("fields.refundAmount")}</span>
        <span className='text-lg font-semibold text-foreground'>{formatMoney(refund)}</span>
      </div>

      <Buttons type='submit' loading={isSubmitting} className='w-full rounded-full'>
        {tCommon("save")}
      </Buttons>
    </form>
  );
};
