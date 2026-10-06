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
import type { IOrderItem, IOrderSku } from "../models/order.interface";
import { formatMoney } from "../constants";

/** Vista previa de importes (el cálculo definitivo lo hace el backend). */
export const computeItemAmounts = (unitPrice: number | undefined, quantity: number, discount: number) => {
  const subtotal = (unitPrice ?? 0) * (Number(quantity) || 0);
  const total = Math.max(subtotal - (Number(discount) || 0), 0);
  return { subtotal, total };
};

export const FormOrderItem = ({
  initialValues,
  validationSchema,
  onSubmit,
  skus,
  frozen = null,
}: IFormProps<any> & { skus: IOrderSku[]; frozen?: IOrderItem | null }) => {
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

  const [skuId, quantity, discount] = useWatch({
    control,
    name: ["sku_id", "quantity", "discount"],
  }) as [string, number, number];

  const skuOptions = useMemo(() => {
    const options = skus.map((sku) => ({
      id: String(sku.id),
      value: String(sku.id),
      label: `${sku.label} · ${formatMoney(sku.unit_price)}`,
    }));
    // La línea guardada puede ser de un SKU que ya no está a la venta: se mantiene visible.
    if (frozen?.sku_id != null && !skus.some((sku) => sku.id === frozen.sku_id)) {
      options.unshift({
        id: String(frozen.sku_id),
        value: String(frozen.sku_id),
        label: `${frozen.product_name ?? `#${frozen.product_id}`} · ${frozen.sku_code ?? ""} · ${formatMoney(frozen.unit_price)}`,
      });
    }
    return options;
  }, [skus, frozen]);

  // Si no cambia el SKU, se conserva el precio congelado de la línea.
  const keepsFrozenPrice = frozen?.sku_id != null && String(frozen.sku_id) === String(skuId);
  const unitPrice = keepsFrozenPrice ? frozen?.unit_price : skus.find((sku) => String(sku.id) === String(skuId))?.unit_price;
  const { subtotal, total } = computeItemAmounts(unitPrice, quantity, discount);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <FormSelectField
          controller={{ control, name: "sku_id" }}
          label={t("fields.skuId")}
          description={keepsFrozenPrice ? t("frozenPrice") : t("priceFromSku")}
          data={skuOptions}
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

      <dl className='grid grid-cols-3 gap-4 rounded-xl border border-border bg-muted/30 p-4 text-sm'>
        <div>
          <dt className='text-muted-foreground'>{t("fields.unitPrice")}</dt>
          <dd className='mt-1 text-lg font-semibold text-foreground'>{formatMoney(unitPrice)}</dd>
        </div>
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
