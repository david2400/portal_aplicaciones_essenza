/** @format */

"use client";

import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@repo/ui/form/scenes/form-field";
import { FormSelectField } from "@repo/ui/form/scenes/form-select";
import { FormTextAreaField } from "@repo/ui/form/scenes/form-area";
import { Buttons } from "@repo/ui/buttons/scenes/index";
import type { IFormProps } from "@repo/ui/form/models/form.interface";
import type { ISelectOption } from "@repo/ui/form/models";
import { MOVEMENT_TYPES, type ISkuOption } from "../models/inventory-movement.interface";

export const FormInventoryMovement = ({
  initialValues,
  validationSchema,
  onSubmit,
  products,
  warehouses,
  skusByProduct = {},
}: IFormProps<any> & {
  products: ISelectOption[];
  warehouses: ISelectOption[];
  /** Variantes por producto (id de producto → SKUs); vacío si no tiene variantes. */
  skusByProduct?: Record<string, ISkuOption[]>;
}) => {
  const t = useTranslations("Administre.inventoryMovement");
  const tCommon = useTranslations("Administre.common");
  type MovementInputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<MovementInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  const type = useWatch({ control, name: "type" }) as string;
  const productId = useWatch({ control, name: "product_id" }) as string | number | undefined;
  const skuOptions: ISelectOption[] = (skusByProduct[String(productId ?? "")] ?? [])
    .filter((sku) => sku.id != null)
    .map((sku) => ({ id: String(sku.id), value: String(sku.id), label: sku.code ? `${sku.name} · ${sku.code}` : (sku.name ?? `#${sku.id}`) }));
  const showFrom = type === "EXIT" || type === "TRANSFER";
  const showTo = type === "ENTRY" || type === "TRANSFER";

  const typeOptions = MOVEMENT_TYPES.map((value) => ({
    id: value,
    value,
    label: t(`types.${value}`),
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <FormSelectField
          controller={{ control, name: "type" }}
          label={t("fields.type")}
          data={typeOptions}
          triggerClassName='!w-full'
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "quantity" }}
          type='number'
          step='1'
          min={1}
          label={t("fields.quantity")}
          className='col-span-12 md:col-span-6'
        />

        <FormSelectField
          controller={{ control, name: "product_id" }}
          label={t("fields.productId")}
          data={products}
          placeholder={tCommon("selectPlaceholder")}
          searchable
          triggerClassName='!w-full'
          className='col-span-12'
        />

        {skuOptions.length > 0 ? (
          <FormSelectField
            controller={{ control, name: "sku_id" }}
            label={t("fields.skuId")}
            description={t("skuHint")}
            data={skuOptions}
            placeholder={tCommon("selectPlaceholder")}
            triggerClassName='!w-full'
            className='col-span-12'
          />
        ) : null}

        {showFrom ? (
          <FormSelectField
            controller={{ control, name: "from_warehouse_id" }}
            label={t("fields.fromWarehouseId")}
            data={warehouses}
            placeholder={tCommon("selectPlaceholder")}
            triggerClassName='!w-full'
            className='col-span-12 md:col-span-6'
          />
        ) : null}

        {showTo ? (
          <FormSelectField
            controller={{ control, name: "to_warehouse_id" }}
            label={t("fields.toWarehouseId")}
            data={warehouses}
            placeholder={tCommon("selectPlaceholder")}
            triggerClassName='!w-full'
            className='col-span-12 md:col-span-6'
          />
        ) : null}

        <FormTextAreaField
          controller={{ control, name: "reason" }}
          label={t("fields.reason")}
          className='col-span-12'
        />
      </div>
      <Buttons type='submit' loading={isSubmitting} className='w-full rounded-full'>
        {t("submit")}
      </Buttons>
    </form>
  );
};
