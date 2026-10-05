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
import { EVIDENCE_TYPES } from "../constants";

export const FormEvidence = ({ initialValues, validationSchema, onSubmit }: IFormProps<any>) => {
  const t = useTranslations("Administre.devolution.evidences");
  const tCommon = useTranslations("Administre.common");
  type EvidenceInputs = z.infer<typeof validationSchema>;

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<EvidenceInputs>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  const typeOptions = EVIDENCE_TYPES.map((type) => ({
    id: type,
    value: type,
    label: t(`types.${type}`),
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-12 gap-4'>
        <FormSelectField
          controller={{ control, name: "evidenceType" }}
          label={t("fields.evidenceType")}
          data={typeOptions}
          triggerClassName='!w-full'
          className='col-span-12 md:col-span-4'
        />

        <FormField
          controller={{ control, name: "resourceUrl" }}
          type='url'
          label={t("fields.resourceUrl")}
          placeholder='https://'
          className='col-span-12 md:col-span-8'
        />

        <FormField
          controller={{ control, name: "recordedBy" }}
          label={t("fields.recordedBy")}
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
