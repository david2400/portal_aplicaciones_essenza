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
import { FormCheckboxField } from "@repo/ui/form/scenes/form-checkbox";
import { Buttons } from "@repo/ui/buttons/scenes/index";
import type { IFormProps } from "@repo/ui/form/models/form.interface";
import { DISCOUNT_TYPES, type INamedItem } from "../models/coupon.interface";

const toItems = (items: INamedItem[]) =>
  items
    .filter((item) => item.id != null)
    .map((item) => ({ id: item.id as number, value: String(item.id), label: item.name ?? `#${item.id}` }));

const Fieldset = ({ legend, children }: { legend: string; children: React.ReactNode }) => (
  <fieldset className='col-span-12 grid grid-cols-12 gap-4 rounded-xl border border-border p-4'>
    <legend className='px-1 text-sm font-semibold text-foreground'>{legend}</legend>
    {children}
  </fieldset>
);

export const FormCoupon = ({
  initialValues,
  validationSchema,
  onSubmit,
  categories,
  products,
}: IFormProps<any> & { categories: INamedItem[]; products: INamedItem[] }) => {
  const t = useTranslations("Administre.coupon");
  const tCommon = useTranslations("Administre.common");
  type CouponInputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CouponInputs>({ resolver: zodResolver(validationSchema), defaultValues: initialValues });

  const discountType = useWatch({ control, name: "discountType" }) as string;
  const categoryItems = useMemo(() => toItems(categories), [categories]);
  const productItems = useMemo(() => toItems(products), [products]);

  const typeOptions = DISCOUNT_TYPES.map((type) => ({ id: type, value: type, label: t(`types.${type}`) }));
  const booleanOptions = [
    { id: "true", value: "true", label: tCommon("yes") },
    { id: "false", value: "false", label: tCommon("no") },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <Fieldset legend={t("sections.general")}>
          <FormField
            controller={{ control, name: "code" }}
            label={t("fields.code")}
            description={t("codeHint")}
            className='col-span-12 md:col-span-4'
            classNameInput='uppercase'
          />
          <FormField
            controller={{ control, name: "name" }}
            label={t("fields.name")}
            className='col-span-12 md:col-span-8'
          />
          <FormTextAreaField
            controller={{ control, name: "description" }}
            label={t("fields.description")}
            className='col-span-12'
          />
        </Fieldset>

        <Fieldset legend={t("sections.discount")}>
          <FormSelectField
            controller={{ control, name: "discountType" }}
            label={t("fields.discountType")}
            data={typeOptions}
            triggerClassName='!w-full'
            className='col-span-12 md:col-span-4'
          />
          <FormField
            controller={{ control, name: "discountValue" }}
            type='number'
            step='0.01'
            min={0}
            label={discountType === "PERCENTAGE" ? t("fields.discountPercent") : t("fields.discountValue")}
            className='col-span-12 sm:col-span-6 md:col-span-4'
          />
          <FormField
            controller={{ control, name: "maximumDiscountAmount" }}
            type='number'
            step='0.01'
            min={0}
            label={t("fields.maximumDiscountAmount")}
            className='col-span-12 sm:col-span-6 md:col-span-4'
          />
          <FormField
            controller={{ control, name: "minimumOrderAmount" }}
            type='number'
            step='0.01'
            min={0}
            label={t("fields.minimumOrderAmount")}
            className='col-span-12 sm:col-span-6 md:col-span-4'
          />
          <FormField
            controller={{ control, name: "usageLimit" }}
            type='number'
            step='1'
            min={1}
            label={t("fields.usageLimit")}
            description={t("usageLimitHint")}
            className='col-span-12 sm:col-span-6 md:col-span-4'
          />
        </Fieldset>

        <Fieldset legend={t("sections.validity")}>
          <FormField
            controller={{ control, name: "validFrom" }}
            type='datetime-local'
            label={t("fields.validFrom")}
            className='col-span-12 md:col-span-6'
          />
          <FormField
            controller={{ control, name: "validUntil" }}
            type='datetime-local'
            label={t("fields.validUntil")}
            className='col-span-12 md:col-span-6'
          />
          <FormSelectField
            controller={{ control, name: "isActive" }}
            label={t("fields.isActive")}
            data={booleanOptions}
            triggerClassName='!w-full'
            className='col-span-12 sm:col-span-6'
          />
          <FormSelectField
            controller={{ control, name: "isPublic" }}
            label={t("fields.isPublic")}
            data={booleanOptions}
            description={t("isPublicHint")}
            triggerClassName='!w-full'
            className='col-span-12 sm:col-span-6'
          />
        </Fieldset>

        <Fieldset legend={t("sections.rules")}>
          <p className='col-span-12 text-sm text-muted-foreground'>{t("rulesHint")}</p>
          {(
            [
              ["applicableCategories", categoryItems],
              ["excludedCategories", categoryItems],
              ["applicableProducts", productItems],
              ["excludedProducts", productItems],
            ] as const
          ).map(([name, items]) => (
            <div key={name} className='col-span-12 max-h-48 overflow-y-auto rounded-lg border border-border p-3 md:col-span-6'>
              <FormCheckboxField controller={{ control, name }} label={t(`fields.${name}`)} items={[...items]} />
            </div>
          ))}
        </Fieldset>
      </div>

      <Buttons type='submit' loading={isSubmitting} className='w-full rounded-full'>
        {tCommon("save")}
      </Buttons>
    </form>
  );
};
