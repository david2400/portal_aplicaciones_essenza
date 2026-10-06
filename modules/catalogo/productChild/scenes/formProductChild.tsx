/** @format */

"use client";

import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { FormField } from "@repo/ui/form/scenes/form-field";
import { FormTextAreaField } from "@repo/ui/form/scenes/form-area";
import { FormSelectField } from "@repo/ui/form/scenes/form-select";
import { Buttons } from "@repo/ui/buttons/scenes/index";
import type { IFormProps } from "@repo/ui/form/models/form.interface";
import type { INamedItem } from "../models/productChild.interface";

export const FormProductChild = ({
  initialValues,
  validationSchema,
  onSubmit,
  products,
}: IFormProps<any> & { products: INamedItem[] }) => {
  const t = useTranslations("Administre.productChild");
  const tCommon = useTranslations("Administre.common");
  type Inputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<Inputs>({ resolver: zodResolver(validationSchema), defaultValues: initialValues });

  const imageUrl = useWatch({ control, name: "image_url" }) as string | undefined;

  const productOptions = products
    .filter((item) => item.id != null)
    .map((item) => ({ id: String(item.id), value: String(item.id), label: item.name ?? `#${item.id}` }));
  const booleanOptions = [
    { id: "true", value: "true", label: tCommon("yes") },
    { id: "false", value: "false", label: tCommon("no") },
  ];
  const showPreview = Boolean(imageUrl && /^https?:\/\//i.test(imageUrl));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <FormSelectField
          controller={{ control, name: "product_id" }}
          label={t("fields.productId")}
          data={productOptions}
          triggerClassName='!w-full'
          className='col-span-12 md:col-span-6'
        />
        <FormField
          controller={{ control, name: "name" }}
          label={t("fields.name")}
          description={t("nameHint")}
          className='col-span-12 md:col-span-6'
        />
        <FormField
          controller={{ control, name: "unit_price" }}
          type='number'
          step='0.01'
          min={0}
          label={t("fields.unitPrice")}
          className='col-span-12 sm:col-span-4'
        />
        <FormField
          controller={{ control, name: "stock" }}
          type='number'
          step='1'
          min={0}
          label={t("fields.stock")}
          className='col-span-12 sm:col-span-4'
        />
        <FormSelectField
          controller={{ control, name: "available" }}
          label={t("fields.available")}
          data={booleanOptions}
          triggerClassName='!w-full'
          className='col-span-12 sm:col-span-4'
        />
        <FormField
          controller={{ control, name: "image_url" }}
          label={t("fields.imageUrl")}
          placeholder='https://'
          className='col-span-12 md:col-span-9'
        />
        <div className='col-span-12 flex items-end md:col-span-3'>
          {showPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={t("imagePreview")}
              className='h-20 w-20 rounded-xl border border-border object-cover'
            />
          ) : (
            <div className='flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-border text-center text-[10px] text-muted-foreground'>
              {t("noImage")}
            </div>
          )}
        </div>
        <FormTextAreaField
          controller={{ control, name: "description" }}
          label={t("fields.description")}
          className='col-span-12'
        />
      </div>
      <div className='flex justify-end'>
        <Buttons type='submit' loading={isSubmitting}>
          {tCommon("save")}
        </Buttons>
      </div>
    </form>
  );
};
