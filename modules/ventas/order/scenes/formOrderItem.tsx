/** @format */

"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@repo/ui/form/scenes/form-field";
import { FormSelectField } from "@repo/ui/form/scenes/form-select";
import { Buttons } from "@repo/ui/buttons/scenes/index";
import type { IFormProps } from "@repo/ui/form/models/form.interface";
import type { IOrderProduct } from "../models/order.interface";
import { formatMoney } from "../constants";

/** Calcula subtotal y total de un ítem a partir del precio de venta del producto. */
export const computeItemAmounts = (
  product: IOrderProduct | undefined,
  quantity: number,
  discount: number,
) => {
  const subtotal = (product?.unitPrice ?? 0) * (Number(quantity) || 0);
  const total = Math.max(subtotal - (Number(discount) || 0), 0);
  return { subtotal, total };
};

export const FormOrderItem = ({
  initialValues,
  validationSchema,
  onSubmit,
  products,
}: IFormProps<any> & { products: IOrderProduct[] }) => {
  const t = useTranslations("Administre.order.items");
  const tCommon = useTranslations("Administre.common");
  type ItemInputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ItemInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  const [productId, quantity, discount] = useWatch({
    control,
    name: ["productId", "quantity", "discount"],
  }) as [string, number, number];

  const productOptions = useMemo(
    () =>
      products
        .filter((product) => product.id != null)
        .map((product) => ({
          id: String(product.id),
          value: String(product.id),
          label: `${product.name ?? `#${product.id}`} · ${formatMoney(product.unitPrice)}`,
        })),
    [products],
  );

  const selected = products.find((product) => String(product.id) === String(productId));
  const { subtotal, total } = computeItemAmounts(selected, quantity, discount);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <FormSelectField
          controller={{ control, name: "productId" }}
          label={t("fields.productId")}
          data={productOptions}
          placeholder={tCommon("selectPlaceholder")}
          searchable
          triggerClassName='!w-full'
          className='col-span-12'
        />

        <FormField
          controller={{ control, name: "quantity" }}
          type='number'
          step='1'
          min={1}
          label={t("fields.quantity")}
          className='col-span-12 sm:col-span-6'
        />

        <FormField
          controller={{ control, name: "discount" }}
          type='number'
          step='0.01'
          min={0}
          label={t("fields.discount")}
          className='col-span-12 sm:col-span-6'
        />
      </div>

      <dl className='grid grid-cols-2 gap-4 rounded-xl border border-border bg-muted/30 p-4 text-sm'>
        <div>
          <dt className='text-muted-foreground'>{t("fields.subtotal")}</dt>
          <dd className='mt-1 text-lg font-semibold text-foreground'>{formatMoney(subtotal)}</dd>
        </div>
        <div>
          <dt className='text-muted-foreground'>{t("fields.total")}</dt>
          <dd className='mt-1 text-lg font-semibold text-foreground'>{formatMoney(total)}</dd>
        </div>
      </dl>

      <Buttons type='submit' loading={isSubmitting} className='w-full rounded-full'>
        {tCommon("save")}
      </Buttons>
    </form>
  );
};
