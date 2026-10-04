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
import type { IRecommendationProduct } from "../models/recommendation.interface";
import { RECOMMENDATION_CONTEXTS, RECOMMENDATION_TYPES, formatMoney } from "../constants";

export const FormRecommendation = ({
  initialValues,
  validationSchema,
  onSubmit,
  products,
  lockIdentity = false,
}: IFormProps<any> & { products: IRecommendationProduct[]; lockIdentity?: boolean }) => {
  const t = useTranslations("Administre.recommendation");
  const tCommon = useTranslations("Administre.common");
  type RecommendationInputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RecommendationInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

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

  const typeOptions = RECOMMENDATION_TYPES.map((value) => ({ id: value, value, label: t(`types.${value}`) }));
  const contextOptions = RECOMMENDATION_CONTEXTS.map((value) => ({
    id: value,
    value,
    label: t(`contexts.${value}`),
  }));
  const booleanOptions = [
    { id: "true", value: "true", label: tCommon("yes") },
    { id: "false", value: "false", label: tCommon("no") },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <FormField
          controller={{ control, name: "customerId" }}
          type='number'
          step='1'
          min={1}
          disabled={lockIdentity}
          label={t("fields.customerId")}
          className='col-span-12 md:col-span-4'
        />
        <FormSelectField
          controller={{ control, name: "productId" }}
          label={t("fields.productId")}
          data={productOptions}
          placeholder={tCommon("selectPlaceholder")}
          searchable
          disabled={lockIdentity}
          triggerClassName='!w-full'
          className='col-span-12 md:col-span-8'
        />
        {lockIdentity ? (
          <p className='col-span-12 -mt-2 text-xs text-muted-foreground'>{t("identityLocked")}</p>
        ) : null}
        <FormSelectField
          controller={{ control, name: "recommendationType" }}
          label={t("fields.recommendationType")}
          data={typeOptions}
          triggerClassName='!w-full'
          className='col-span-12 md:col-span-6'
        />
        <FormSelectField
          controller={{ control, name: "context" }}
          label={t("fields.context")}
          data={contextOptions}
          triggerClassName='!w-full'
          className='col-span-12 md:col-span-6'
        />
        <FormField
          controller={{ control, name: "score" }}
          type='number'
          step='0.01'
          min={0}
          max={1}
          label={t("fields.score")}
          className='col-span-12 sm:col-span-6 md:col-span-3'
        />
        <FormField
          controller={{ control, name: "position" }}
          type='number'
          step='1'
          min={1}
          label={t("fields.position")}
          className='col-span-12 sm:col-span-6 md:col-span-3'
        />
        <FormSelectField
          controller={{ control, name: "isClicked" }}
          label={t("fields.isClicked")}
          data={booleanOptions}
          triggerClassName='!w-full'
          className='col-span-12 sm:col-span-6 md:col-span-3'
        />
        <FormSelectField
          controller={{ control, name: "isPurchased" }}
          label={t("fields.isPurchased")}
          data={booleanOptions}
          triggerClassName='!w-full'
          className='col-span-12 sm:col-span-6 md:col-span-3'
        />
        <FormTextAreaField
          controller={{ control, name: "reason" }}
          label={t("fields.reason")}
          rows={2}
          className='col-span-12'
        />
      </div>
      <Buttons type='submit' loading={isSubmitting} className='w-full'>
        {tCommon("save")}
      </Buttons>
    </form>
  );
};
