/** @format */

"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@repo/ui/form/scenes/form-field";
import { FormTextAreaField } from "@repo/ui/form/scenes/form-area";
import { FormSelectField } from "@repo/ui/form/scenes/form-select";
import { PRODUCT_STATUSES } from "../models/product.interface";
import { Buttons } from "@repo/ui/buttons/scenes/index";
import type { IFormProps } from "@repo/ui/form/models/form.interface";
import type { ISelectOption } from "@repo/ui/form/models";

export type ProductFormOptions = Partial<Record<string, ISelectOption[]>>;

export const FormProduct = ({
  initialValues,
  validationSchema,
  onSubmit,
  options = {},
}: IFormProps<any> & { options?: ProductFormOptions }) => {
  const t = useTranslations("Administre.product");
  const tCommon = useTranslations("Administre.common");
  type ProductInputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ProductInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  const statusOptions: ISelectOption[] = PRODUCT_STATUSES.map((status) => ({
    id: status,
    value: status,
    label: t(`statuses.${status}`),
  }));

  const booleanOptions: ISelectOption[] = [
    { id: "true", value: "true", label: tCommon("yes") },
    { id: "false", value: "false", label: tCommon("no") },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <FormField
          controller={{ control, name: "name" }}
          label={t("fields.name")}
          className='col-span-12 md:col-span-6'
        />

        <FormSelectField
          controller={{ control, name: "supplier_id" }}
          label={t("fields.supplierId")}
          data={options.suppliers ?? []}
          placeholder={tCommon("selectPlaceholder")}
          triggerClassName='!w-full'
          className='col-span-12 md:col-span-6'
        />

        <FormSelectField
          controller={{ control, name: "brand_id" }}
          label={t("fields.brandId")}
          data={options.brands ?? []}
          placeholder={tCommon("selectPlaceholder")}
          triggerClassName='!w-full'
          className='col-span-12 md:col-span-6'
        />

        <FormSelectField
          controller={{ control, name: "category_id" }}
          label={t("fields.categoryId")}
          data={options.categories ?? []}
          placeholder={tCommon("selectPlaceholder")}
          triggerClassName='!w-full'
          className='col-span-12 md:col-span-6'
        />

        <FormSelectField
          controller={{ control, name: "subcategory_id" }}
          label={t("fields.subcategoryId")}
          data={options.subcategories ?? []}
          placeholder={tCommon("selectPlaceholder")}
          triggerClassName='!w-full'
          className='col-span-12 md:col-span-6'
        />

        <FormField
          controller={{ control, name: "stock" }}
          type='number'
          step='1'
          min={0}
          label={t("fields.stock")}
          className='col-span-12 sm:col-span-6 md:col-span-3'
        />

        <FormField
          controller={{ control, name: "real_price" }}
          type='number'
          step='0.01'
          min={0}
          label={t("fields.realPrice")}
          className='col-span-12 sm:col-span-6 md:col-span-3'
        />

        <FormField
          controller={{ control, name: "unit_price" }}
          type='number'
          step='0.01'
          min={0}
          label={t("fields.unitPrice")}
          className='col-span-12 sm:col-span-6 md:col-span-3'
        />

        <FormField
          controller={{ control, name: "length" }}
          type='number'
          step='0.01'
          min={0}
          label={t("fields.length")}
          className='col-span-12 sm:col-span-6 md:col-span-3'
        />

        <FormField
          controller={{ control, name: "width" }}
          type='number'
          step='0.01'
          min={0}
          label={t("fields.width")}
          className='col-span-12 sm:col-span-6 md:col-span-3'
        />

        <FormField
          controller={{ control, name: "height" }}
          type='number'
          step='0.01'
          min={0}
          label={t("fields.height")}
          className='col-span-12 sm:col-span-6 md:col-span-3'
        />

        <FormField
          controller={{ control, name: "weight" }}
          type='number'
          step='0.01'
          min={0}
          label={t("fields.weight")}
          className='col-span-12 sm:col-span-6 md:col-span-3'
        />

        <FormField
          controller={{ control, name: "image_url" }}
          label={t("fields.imageUrl")}
          className='col-span-12 md:col-span-6'
        />

        <FormSelectField
          controller={{ control, name: "status" }}
          label={t("fields.status")}
          data={statusOptions}
          triggerClassName='!w-full'
          className='col-span-12 sm:col-span-6 md:col-span-3'
        />

        <FormSelectField
          controller={{ control, name: "is_combo" }}
          label={t("fields.isCombo")}
          data={booleanOptions}
          triggerClassName='!w-full'
          className='col-span-12 sm:col-span-6 md:col-span-3'
        />

        <FormField
          controller={{ control, name: "slug" }}
          label={t("fields.slug")}
          description={t("slugHint")}
          placeholder={t("slugPlaceholder")}
          className='col-span-12 md:col-span-6'
        />

        <FormTextAreaField
          controller={{ control, name: "description" }}
          label={t("fields.description")}
          className='col-span-12'
        />
      </div>
      <Buttons type='submit' loading={isSubmitting} className='w-full rounded-full'>
        {tCommon("save")}
      </Buttons>
    </form>
  );
};
