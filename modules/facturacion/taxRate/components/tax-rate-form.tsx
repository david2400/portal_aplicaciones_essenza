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
import { formatMoney } from "@/lib/format";
import { TAX_KINDS, isTaxKind, type ITaxRate } from "../models/taxRate.interface";
import { validationTaxRate, type TaxRateFormValues } from "../schemas/taxRate.schema";
import { createTaxRateServerAction, updateTaxRateServerAction } from "@/app/[locale]/facturacion/tax-rates/actions";

/** Alta y edición de una tarifa de impuesto (modal del listado). */
export const TaxRateForm = ({ item, onClose }: { item: ITaxRate | null; onClose: () => void }) => {
  const t = useTranslations("Administre.billing.taxRate");
  const tCommon = useTranslations("Administre.common");
  const router = useRouter();
  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<TaxRateFormValues>({
    resolver: zodResolver(validationTaxRate()) as unknown as Resolver<TaxRateFormValues>,
    defaultValues: {
      code: item?.code ?? "",
      name: item?.name ?? "",
      description: item?.description ?? "",
      kind: isTaxKind(item?.kind) ? item.kind : "IVA",
      rate: item?.rate ?? 19,
      is_default: Boolean(item?.is_default),
      active: item?.active !== false,
      position: item?.position ?? 0,
    },
  });
  const values = useWatch({ control }) as TaxRateFormValues;
  const rate = Number(values.rate) || 0;
  const sample = 119000;
  const base = values.kind === "EXCLUDED" || rate === 0 ? sample : sample / (1 + rate / 100);

  const submit = async (form: TaxRateFormValues) => {
    const payload = { ...form, description: form.description || undefined };
    const result = item?.id != null ? await updateTaxRateServerAction(item.id, payload) : await createTaxRateServerAction(payload);
    if (!result.success) {
      notify.error(tCommon("errorTitle"), result.error);
      return;
    }
    notify.success(item ? tCommon("updatedSuccess") : tCommon("createdSuccess"), form.name);
    router.refresh();
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(submit)} className='grid grid-cols-12 gap-4'>
      <FormField controller={{ control, name: "name" }} label={t("fields.name")} required className='col-span-12 sm:col-span-7' />
      <FormField
        controller={{ control, name: "code" }}
        label={t("fields.code")}
        description={t("codeHint")}
        className='col-span-12 sm:col-span-5'
      />
      <FormSelectField
        controller={{ control, name: "kind" }}
        label={t("fields.kind")}
        data={TAX_KINDS.map((kind) => ({ value: kind, label: t(`kinds.${kind}`) }))}
        onValueChange={(value: string) => {
          if (value === "EXCLUDED") setValue("rate", 0, { shouldValidate: true });
        }}
        triggerClassName='!w-full'
        className='col-span-12 sm:col-span-6'
      />
      <FormField
        controller={{ control, name: "rate" }}
        type='number'
        step='0.01'
        min={0}
        max={100}
        suffix='%'
        disabled={values.kind === "EXCLUDED"}
        label={t("fields.rate")}
        className='col-span-12 sm:col-span-6'
      />
      <FormField controller={{ control, name: "description" }} label={t("fields.description")} className='col-span-12' />
      <p className='col-span-12 rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground'>
        {t("example", { price: formatMoney(sample), base: formatMoney(base), tax: formatMoney(sample - base) })}
      </p>
      <div className='col-span-12 grid gap-3 sm:grid-cols-2'>
        <ToggleRow
          id='tax-default'
          label={t("fields.isDefault")}
          description={item?.is_default ? t("defaultLocked") : t("defaultHint")}
          checked={Boolean(values.is_default)}
          disabled={Boolean(item?.is_default)}
          onChange={(checked) => setValue("is_default", checked, { shouldDirty: true })}
        />
        <ToggleRow
          id='tax-active'
          label={t("fields.active")}
          description={t("activeHint")}
          checked={Boolean(values.active)}
          disabled={Boolean(values.is_default)}
          onChange={(checked) => setValue("active", checked, { shouldDirty: true, shouldValidate: true })}
        />
      </div>
      {errors.active?.message ? <p className='col-span-12 text-sm text-destructive'>{errors.active.message}</p> : null}
      {item && ((item.products_count ?? 0) > 0 || (item.lines_count ?? 0) > 0) ? (
        <p className='col-span-12 text-xs text-muted-foreground'>
          {t("usage", { products: item.products_count ?? 0, lines: item.lines_count ?? 0 })}
        </p>
      ) : null}
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
