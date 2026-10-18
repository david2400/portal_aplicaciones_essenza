/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Buttons } from "@repo/ui/buttons/scenes";
import { FormField } from "@repo/ui/form/scenes/form-field";
import { FormSelectField } from "@repo/ui/form/scenes/form-select";
import { ToggleRow } from "@/components/form-sections";
import { notify } from "@/components/notifications";
import { formatNumber } from "@/lib/format";
import { BILLING_ENVIRONMENTS, RESOLUTION_KINDS, type IResolution } from "../models/resolution.interface";
import { validationResolution, type ResolutionFormValues } from "../schemas/resolution.schema";
import { createResolutionServerAction, updateResolutionServerAction } from "@/app/[locale]/facturacion/resolutions/actions";

/** Numeración DIAN: con documentos emitidos no cambian tipo, prefijo ni número inicial. */
export const ResolutionForm = ({ item, onClose }: { item: IResolution | null; onClose: () => void }) => {
  const t = useTranslations("Administre.billing.resolution");
  const tCommon = useTranslations("Administre.common");
  const router = useRouter();
  const used = Boolean(item?.used);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<ResolutionFormValues>({
    resolver: zodResolver(validationResolution()) as unknown as Resolver<ResolutionFormValues>,
    defaultValues: {
      kind: item?.kind === "CREDIT_NOTE" ? "CREDIT_NOTE" : "INVOICE",
      environment: item?.environment === "PRODUCTION" ? "PRODUCTION" : "TEST",
      prefix: item?.prefix ?? "",
      resolution_number: item?.resolution_number ?? "",
      resolution_date: item?.resolution_date ?? "",
      technical_key: item?.technical_key ?? "",
      from_number: item?.from_number ?? 1,
      to_number: item?.to_number ?? 1000,
      next_number: item?.next_number ?? 1,
      valid_from: item?.valid_from ?? "",
      valid_to: item?.valid_to ?? "",
      active: item?.active !== false,
    },
  });
  const values = useWatch({ control }) as ResolutionFormValues;
  const total = Math.max(0, Number(values.to_number) - Number(values.from_number) + 1);
  const remaining = Math.max(0, Number(values.to_number) - Number(values.next_number) + 1);

  const submit = async (form: ResolutionFormValues) => {
    const payload = {
      ...form,
      resolution_number: form.resolution_number || undefined,
      resolution_date: form.resolution_date || undefined,
      technical_key: form.technical_key || undefined,
      valid_from: form.valid_from || undefined,
      valid_to: form.valid_to || undefined,
    };
    const result = item?.id != null ? await updateResolutionServerAction(item.id, payload) : await createResolutionServerAction(payload);
    if (!result.success) {
      notify.error(tCommon("errorTitle"), result.error);
      return;
    }
    notify.success(item ? tCommon("updatedSuccess") : tCommon("createdSuccess"));
    router.refresh();
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(submit)} className='grid grid-cols-12 gap-4'>
      {used ? <p className='col-span-12 rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground'>{t("usedHint")}</p> : null}
      <FormSelectField
        controller={{ control, name: "kind" }}
        label={t("fields.kind")}
        data={RESOLUTION_KINDS.map((kind) => ({ value: kind, label: t(`kinds.${kind}`) }))}
        disabled={used}
        triggerClassName='!w-full'
        className='col-span-12 sm:col-span-6'
      />
      <FormSelectField
        controller={{ control, name: "environment" }}
        label={t("fields.environment")}
        data={BILLING_ENVIRONMENTS.map((env) => ({ value: env, label: t(`environments.${env}`) }))}
        triggerClassName='!w-full'
        className='col-span-12 sm:col-span-6'
      />
      <FormField
        controller={{ control, name: "prefix" }}
        label={t("fields.prefix")}
        description={t("prefixHint")}
        disabled={used}
        className='col-span-12 sm:col-span-4'
      />
      <FormField
        controller={{ control, name: "resolution_number" }}
        label={t("fields.resolutionNumber")}
        className='col-span-12 sm:col-span-4'
      />
      <FormField controller={{ control, name: "resolution_date" }} type='date' label={t("fields.resolutionDate")} className='col-span-12 sm:col-span-4' />
      <FormField
        controller={{ control, name: "from_number" }}
        type='number'
        min={0}
        label={t("fields.fromNumber")}
        disabled={used}
        className='col-span-12 sm:col-span-4'
      />
      <FormField controller={{ control, name: "to_number" }} type='number' min={0} label={t("fields.toNumber")} className='col-span-12 sm:col-span-4' />
      <FormField
        controller={{ control, name: "next_number" }}
        type='number'
        min={0}
        label={t("fields.nextNumber")}
        description={t("nextHint")}
        className='col-span-12 sm:col-span-4'
      />
      <FormField controller={{ control, name: "valid_from" }} type='date' label={t("fields.validFrom")} className='col-span-12 sm:col-span-6' />
      <FormField controller={{ control, name: "valid_to" }} type='date' label={t("fields.validTo")} className='col-span-12 sm:col-span-6' />
      <FormField
        controller={{ control, name: "technical_key" }}
        label={t("fields.technicalKey")}
        description={t("technicalKeyHint")}
        className='col-span-12'
      />
      <p className='col-span-12 rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground'>
        {t("summary", {
          first: `${values.prefix ?? ""}${values.next_number ?? ""}`,
          total: formatNumber(total),
          remaining: formatNumber(remaining),
        })}
      </p>
      <div className='col-span-12'>
        <ToggleRow
          id='resolution-active'
          label={t("fields.active")}
          description={t("activeHint")}
          checked={Boolean(values.active)}
          onChange={(checked) => setValue("active", checked, { shouldDirty: true })}
        />
      </div>
      <div className='col-span-12 flex justify-end gap-2'>
        <Buttons type='button' variant='outline' className='rounded-full' onClick={onClose}>
          {tCommon("cancel")}
        </Buttons>
        <Buttons type='submit' loading={isSubmitting} className='rounded-full'>
          {tCommon("save")}
        </Buttons>
      </div>
    </form>
  );
};
