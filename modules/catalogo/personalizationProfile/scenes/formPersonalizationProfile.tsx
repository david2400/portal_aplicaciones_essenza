/** @format */

"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@repo/ui/form/scenes/form-field";
import { FormTextAreaField } from "@repo/ui/form/scenes/form-area";
import { FormSelectField } from "@repo/ui/form/scenes/form-select";
import { Buttons } from "@repo/ui/buttons/scenes/index";
import type { IFormProps } from "@repo/ui/form/models/form.interface";
import { JSON_FIELDS, SEGMENTS } from "../constants";

import { fieldKey } from "@/shared/i18n/field-key";
export const FormPersonalizationProfile = ({
  initialValues,
  validationSchema,
  onSubmit,
}: IFormProps<any>) => {
  const t = useTranslations("Administre.personalization");
  const tCommon = useTranslations("Administre.common");
  type ProfileInputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<ProfileInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  const segmentOptions = SEGMENTS.map((value) => ({ id: value, value, label: t(`segments.${value}`) }));
  // Abre la sección avanzada si alguno de sus campos tiene error.
  const advancedHasError = JSON_FIELDS.some((field) => field in (errors as Record<string, unknown>));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <FormField
          controller={{ control, name: "customer_id" }}
          type='number'
          step='1'
          min={1}
          label={t("fields.customerId")}
          className='col-span-12 sm:col-span-6 md:col-span-4'
        />
        <FormSelectField
          controller={{ control, name: "segment" }}
          label={t("fields.segment")}
          data={segmentOptions}
          triggerClassName='!w-full'
          className='col-span-12 sm:col-span-6 md:col-span-4'
        />
        <FormField
          controller={{ control, name: "personalization_score" }}
          type='number'
          step='0.01'
          min={0}
          max={1}
          label={t("fields.personalizationScore")}
          className='col-span-12 sm:col-span-6 md:col-span-4'
        />
        <FormField
          controller={{ control, name: "status" }}
          label={t("fields.status")}
          className='col-span-12 sm:col-span-6'
        />
        <FormField
          controller={{ control, name: "session_id" }}
          label={t("fields.sessionId")}
          className='col-span-12 sm:col-span-6'
        />
      </div>

      <details open={advancedHasError || undefined} className='rounded-xl border border-border p-4'>
        <summary className='cursor-pointer text-sm font-semibold text-foreground'>{t("advanced")}</summary>
        <p className='mt-2 text-xs text-muted-foreground'>{t("advancedHint")}</p>
        <div className='mt-4 grid grid-cols-12 gap-4'>
          {JSON_FIELDS.map((field) => (
            <FormTextAreaField
              key={field}
              controller={{ control, name: field }}
              label={t(fieldKey(field) as never)}
              rows={4}
              classNameInput='font-mono text-xs'
              className='col-span-12 md:col-span-6'
            />
          ))}
        </div>
      </details>

      <Buttons type='submit' loading={isSubmitting} className='w-full rounded-full'>
        {tCommon("save")}
      </Buttons>
    </form>
  );
};
