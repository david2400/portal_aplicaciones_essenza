/** @format */

"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@repo/ui/form/scenes/form-field";
import { FormTextAreaField } from "@repo/ui/form/scenes/form-area";
import { FormSelectField } from "@repo/ui/form/scenes/form-select";
import { Buttons } from "@repo/ui/buttons/scenes/index";
import type { IFormProps } from "@repo/ui/form/models/form.interface";
import type { IReturnableLine } from "../models/devolution.interface";
import { formatMoney } from "../constants";

/**
 * Producto de una devolución pendiente: línea de la orden y cantidad (hasta lo que falta por
 * devolver). El precio lo congela el backend desde la orden; recepción e inspección van por el flujo.
 */
export const FormDevolutionDetail = ({
  initialValues,
  validationSchema,
  onSubmit,
  lines,
  editing,
}: IFormProps<any> & { lines: IReturnableLine[]; editing?: boolean }) => {
  const t = useTranslations("Administre.devolution.details");
  const tr = useTranslations("Administre.devolution.request");
  const tCommon = useTranslations("Administre.common");
  type DetailInputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<DetailInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  const [productOrderId, quantity] = useWatch({ control, name: ["product_order_id", "quantity"] }) as [string, number];
  const selected = lines.find((line) => String(line.product_order_id) === String(productOrderId));

  const lineOptions = useMemo(
    () =>
      lines
        .filter((line) => line.product_order_id != null && ((line.returnable ?? 0) > 0 || editing))
        .map((line) => ({
          value: String(line.product_order_id),
          label: `${line.product_name ?? `#${line.product_order_id}`} · ${tr("availableShort", { count: line.returnable ?? 0 })}`,
        })),
    [lines, tr, editing],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <FormSelectField
          controller={{ control, name: "product_order_id" }}
          label={t("fields.productOrderId")}
          data={lineOptions}
          placeholder={tCommon("selectPlaceholder")}
          searchable
          disabled={editing}
          triggerClassName='!w-full'
          className='col-span-12 md:col-span-8'
        />

        <FormField
          controller={{ control, name: "quantity" }}
          type='number'
          step='1'
          min={1}
          max={selected?.returnable}
          label={t("fields.quantity")}
          description={selected ? tr("availableShort", { count: selected.returnable ?? 0 }) : undefined}
          className='col-span-12 md:col-span-4'
        />

        <FormTextAreaField
          controller={{ control, name: "observation" }}
          label={t("fields.observation")}
          className='col-span-12'
        />
      </div>

      <div className='flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4 text-sm'>
        <span className='text-muted-foreground'>{tr("estimated")}</span>
        <span className='text-lg font-semibold text-foreground'>
          {formatMoney((Number(quantity) || 0) * (selected?.unit_price ?? 0))}
        </span>
      </div>

      <Buttons type='submit' loading={isSubmitting} className='w-full rounded-full'>
        {tCommon("save")}
      </Buttons>
    </form>
  );
};
