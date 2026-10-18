/** @format */

"use client";

import { useEffect, type ComponentType } from "react";
import { useTranslations } from "next-intl";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  HiOutlineAdjustmentsHorizontal,
  HiOutlineBanknotes,
  HiOutlineBuildingLibrary,
  HiOutlineBuildingStorefront,
  HiOutlineCheckCircle,
  HiOutlineClipboardDocument,
  HiOutlineCreditCard,
  HiOutlineDevicePhoneMobile,
  HiOutlineEllipsisHorizontalCircle,
  HiOutlineExclamationTriangle,
  HiOutlineEye,
  HiOutlineGlobeAlt,
  HiOutlineIdentification,
  HiOutlineLink,
  HiOutlineLockClosed,
  HiOutlineReceiptPercent,
  HiOutlineTruck,
} from "react-icons/hi2";
import { FormField } from "@repo/ui/form/scenes/form-field";
import { FormTextAreaField } from "@repo/ui/form/scenes/form-area";
import { Buttons } from "@repo/ui/buttons/scenes/index";
import { Badge } from "@repo/ui/badges/scenes/badge";
import { ActionBar, ChoiceCard, SectionCard, SectionNav, ToggleRow, type FormSectionItem } from "@/components/form-sections";
import { notify } from "@/components/notifications";
import { Link } from "@/shared/i18n/routing";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import {
  KIND_CHANNELS,
  KINDS_WITH_CHANGE,
  PAYMENT_CHANNELS,
  kindsFor,
  type GatewayProvider,
  type IGatewayProvider,
  type PaymentChannel,
  type PaymentKind,
} from "../models/paymentMethod.interface";
import { validationPaymentMethod, type PaymentMethodFormInput, type PaymentMethodFormValues } from "../schemas/paymentMethod.schema";

type IconType = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" }>;

export const CHANNEL_ICONS: Record<PaymentChannel, IconType> = {
  PHYSICAL: HiOutlineBuildingStorefront,
  VIRTUAL: HiOutlineGlobeAlt,
};

export const KIND_ICONS: Record<PaymentKind, IconType> = {
  CASH: HiOutlineBanknotes,
  CARD_TERMINAL: HiOutlineCreditCard,
  BANK_TRANSFER: HiOutlineBuildingLibrary,
  DIGITAL_WALLET: HiOutlineDevicePhoneMobile,
  GATEWAY: HiOutlineLink,
  CASH_ON_DELIVERY: HiOutlineTruck,
  OTHER: HiOutlineEllipsisHorizontalCircle,
};

/** Código sugerido desde el nombre (mayúsculas y guion bajo, como el backend). */
const codeFromName = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/^([0-9])/, "M_$1")
    .slice(0, 40);

const toNumber = (value: unknown) => {
  if (value === "" || value == null) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

/** Monto de ejemplo para mostrar la comisión. */
const SAMPLE_AMOUNT = 100_000;

export interface FormPaymentMethodProps {
  initialValues: PaymentMethodFormInput;
  onSubmit: (values: PaymentMethodFormValues) => Promise<void>;
  providers: IGatewayProvider[];
  isNew?: boolean;
  /** Pagos ya registrados: canal, tipo y pasarela quedan bloqueados. */
  paymentsCount?: number;
  cancelHref: string;
  submitLabel?: string;
}

/**
 * Alta y edición de un medio de pago por secciones: datos, canal y tipo (tarjetas),
 * pasarela (estado de credenciales y URL del webhook), reglas de cobro, comisión,
 * publicación e instrucciones, con vista previa de cómo se verá al cobrar.
 */
export const FormPaymentMethod = ({
  initialValues,
  onSubmit,
  providers,
  isNew = false,
  paymentsCount = 0,
  cancelHref,
  submitLabel,
}: FormPaymentMethodProps) => {
  const t = useTranslations("Administre.paymentMethod");
  const tf = useTranslations("Administre.paymentMethod.form");
  const tCommon = useTranslations("Administre.common");
  const locked = paymentsCount > 0;

  const {
    control,
    handleSubmit,
    setValue,
    getFieldState,
    formState: { isSubmitting, isDirty, errors, submitCount },
  } = useForm<PaymentMethodFormInput, unknown, PaymentMethodFormValues>({
    resolver: zodResolver(validationPaymentMethod()) as unknown as Resolver<
      PaymentMethodFormInput,
      unknown,
      PaymentMethodFormValues
    >,
    defaultValues: initialValues,
  });

  const values = useWatch({ control }) as PaymentMethodFormInput;
  const channel = values.channel as PaymentChannel;
  const kind = values.kind as PaymentKind;
  const provider = values.provider && values.provider !== "none" ? (values.provider as GatewayProvider) : null;
  const providerInfo = providers.find((item) => item.code === provider);

  // Al crear, el código se propone desde el nombre mientras no se edite a mano.
  useEffect(() => {
    if (isNew && !getFieldState("code").isDirty && typeof values.name === "string") {
      setValue("code", codeFromName(values.name), { shouldValidate: false });
    }
  }, [isNew, values.name, getFieldState, setValue]);

  const dirty = { shouldDirty: true, shouldValidate: submitCount > 0 } as const;

  const chooseChannel = (next: PaymentChannel) => {
    setValue("channel", next, dirty);
    if (!KIND_CHANNELS[kind].includes(next)) chooseKind(kindsFor(next)[0] ?? "OTHER");
  };

  const chooseKind = (next: PaymentKind) => {
    setValue("kind", next, dirty);
    if (next !== "GATEWAY") setValue("provider", "none", dirty);
    else if (!provider) setValue("provider", (providers.find((item) => item.configured)?.code as GatewayProvider) ?? "SANDBOX", dirty);
    if (!KINDS_WITH_CHANGE.includes(next)) setValue("allows_change", false, dirty);
    else if (next === "CASH") setValue("allows_change", true, dirty);
    if (next === "CARD_TERMINAL" || next === "BANK_TRANSFER" || next === "DIGITAL_WALLET") setValue("requires_reference", true, dirty);
    if (next === "GATEWAY" || next === "CASH") setValue("requires_reference", false, dirty);
  };

  const copy = async (text?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      notify.success(tf("copied"));
    } catch {
      notify.error(tCommon("errorTitle"), text);
    }
  };

  // ─── Comisión de ejemplo ───────────────────────────────────────────────────────
  const feePercent = toNumber(values.fee_percent) ?? 0;
  const feeFixed = toNumber(values.fee_fixed) ?? 0;
  const sampleFee = Math.round(SAMPLE_AMOUNT * (feePercent / 100) + feeFixed);
  const minAmount = toNumber(values.min_amount);
  const maxAmount = toNumber(values.max_amount);

  // ─── Estado de secciones ──────────────────────────────────────────────────────
  const has = (...fields: (keyof PaymentMethodFormInput)[]) => fields.some((field) => errors[field]);
  const sections: FormSectionItem[] = [
    { id: "pm-basic", title: tf("basic"), state: has("name", "code", "description") ? "error" : values.name?.trim() ? "complete" : "pending" },
    { id: "pm-type", title: tf("type"), state: has("channel", "kind") ? "error" : "complete" },
    ...(kind === "GATEWAY"
      ? [{ id: "pm-gateway", title: tf("gateway"), state: has("provider") ? "error" : provider ? "complete" : "pending" } as FormSectionItem]
      : []),
    { id: "pm-rules", title: tf("rules"), state: has("requires_reference", "allows_change", "min_amount", "max_amount") ? "error" : "optional" },
    { id: "pm-fee", title: tf("fee"), state: has("fee_percent", "fee_fixed") ? "error" : "optional" },
    { id: "pm-publish", title: tf("publish"), state: has("active", "position") ? "error" : "optional" },
    { id: "pm-instructions", title: tf("instructions"), state: has("instructions") ? "error" : "optional" },
  ];
  const stateLabel = (state: FormSectionItem["state"]) => tf(`state.${state}`);
  const kindError = (errors.kind as { message?: string } | undefined)?.message;
  const providerError = (errors.provider as { message?: string } | undefined)?.message;
  const changeError = (errors.allows_change as { message?: string } | undefined)?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='grid gap-6'>
      <div className='grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_300px]'>
        <aside className='hidden lg:block'>
          <div className='sticky top-20'>
            <SectionNav items={sections} title={tf("sections")} progressLabel={tf("progress")} />
          </div>
        </aside>

        <div className='grid content-start gap-6'>
          <SectionCard
            id='pm-basic'
            icon={HiOutlineIdentification}
            title={tf("basic")}
            hint={tf("basicHint")}
            state={sections[0]?.state}
            stateLabel={stateLabel(sections[0]?.state ?? "pending")}>
            <FormField
              controller={{ control, name: "name" }}
              label={t("fields.name")}
              placeholder={tf("namePlaceholder")}
              required
              className='col-span-12 md:col-span-7'
            />
            <FormField
              controller={{ control, name: "code" }}
              label={t("fields.code")}
              description={tf("codeHint")}
              className='col-span-12 md:col-span-5'
            />
            <FormField
              controller={{ control, name: "description" }}
              label={t("fields.description")}
              placeholder={tf("descriptionPlaceholder")}
              className='col-span-12'
            />
          </SectionCard>

          <SectionCard
            id='pm-type'
            icon={HiOutlineAdjustmentsHorizontal}
            title={tf("type")}
            hint={locked ? tf("typeLocked", { count: paymentsCount }) : tf("typeHint")}
            badge={locked ? tf("lockedBadge") : undefined}
            state={has("channel", "kind") ? "error" : "complete"}
            stateLabel={stateLabel(has("channel", "kind") ? "error" : "complete")}>
            <fieldset className='col-span-12 grid gap-3'>
              <legend className='mb-2 text-sm font-medium text-foreground'>{t("fields.channel")}</legend>
              <div className='grid gap-3 sm:grid-cols-2'>
                {PAYMENT_CHANNELS.map((value) => (
                  <ChoiceCard
                    key={value}
                    name='pm-channel'
                    value={value}
                    icon={CHANNEL_ICONS[value]}
                    title={t(`channels.${value}`)}
                    description={t(`channelHints.${value}`)}
                    selected={channel === value}
                    disabled={locked && channel !== value}
                    onSelect={() => chooseChannel(value)}
                  />
                ))}
              </div>
            </fieldset>
            <fieldset className='col-span-12 grid gap-3'>
              <legend className='mb-2 text-sm font-medium text-foreground'>{t("fields.kind")}</legend>
              <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
                {kindsFor(channel).map((value) => (
                  <ChoiceCard
                    key={value}
                    name='pm-kind'
                    value={value}
                    icon={KIND_ICONS[value]}
                    title={t(`kinds.${value}`)}
                    description={t(`kindHints.${value}`)}
                    selected={kind === value}
                    disabled={locked && kind !== value}
                    onSelect={() => chooseKind(value)}
                  />
                ))}
              </div>
              {kindError ? <p className='text-sm text-destructive'>{kindError}</p> : null}
              <p className='flex items-start gap-2 text-xs text-muted-foreground'>
                <HiOutlineCheckCircle className='mt-0.5 h-4 w-4 shrink-0' aria-hidden='true' />
                {kind === "GATEWAY" || kind === "CASH_ON_DELIVERY" ? tf("settlesLater") : tf("settlesNow")}
              </p>
            </fieldset>
          </SectionCard>

          {kind === "GATEWAY" ? (
            <SectionCard
              id='pm-gateway'
              icon={HiOutlineLink}
              title={tf("gateway")}
              hint={tf("gatewayHint")}
              state={sections.find((s) => s.id === "pm-gateway")?.state}
              stateLabel={stateLabel(sections.find((s) => s.id === "pm-gateway")?.state ?? "pending")}>
              <div role='radiogroup' aria-label={t("fields.provider")} className='col-span-12 grid gap-3 md:grid-cols-3'>
                {providers.map((item) => {
                  const code = item.code as GatewayProvider;
                  const selected = provider === code;
                  return (
                    <button
                      key={code}
                      type='button'
                      role='radio'
                      aria-checked={selected}
                      disabled={locked && !selected}
                      onClick={() => setValue("provider", code, dirty)}
                      className={cn(
                        "grid gap-2 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted/40",
                        locked && !selected && "cursor-not-allowed opacity-50",
                      )}>
                      <span className='flex items-center justify-between gap-2'>
                        <span className='font-semibold text-foreground'>{t(`providers.${code}`)}</span>
                        {locked && selected ? <HiOutlineLockClosed className='h-4 w-4 text-muted-foreground' aria-hidden='true' /> : null}
                      </span>
                      <span className='text-xs text-muted-foreground'>{t(`providerHints.${code}`)}</span>
                      <span className='flex flex-wrap gap-1.5'>
                        <Badge variant={item.configured ? "secondary" : "destructive"}>
                          {item.configured ? tf("configured") : tf("notConfigured")}
                        </Badge>
                        {item.environment ? <Badge variant='outline'>{tf(`environments.${item.environment === "production" ? "production" : "test"}`)}</Badge> : null}
                      </span>
                    </button>
                  );
                })}
              </div>
              {providerError ? <p className='col-span-12 text-sm text-destructive'>{providerError}</p> : null}

              {providerInfo ? (
                <div className='col-span-12 grid gap-3 rounded-xl border border-border bg-muted/20 p-4 text-sm'>
                  {!providerInfo.configured ? (
                    <p className='flex gap-2 text-amber-700 dark:text-amber-400'>
                      <HiOutlineExclamationTriangle className='mt-0.5 h-4 w-4 shrink-0' aria-hidden='true' />
                      {tf(`credentials.${provider ?? "SANDBOX"}`)}
                    </p>
                  ) : null}
                  {providerInfo.webhook_url ? (
                    <div className='grid gap-1.5'>
                      <span className='font-medium text-foreground'>{tf("webhookUrl")}</span>
                      <div className='flex items-center gap-2'>
                        <code className='min-w-0 flex-1 truncate rounded-md border border-border bg-background px-2 py-1.5 font-mono text-xs'>
                          {providerInfo.webhook_url}
                        </code>
                        <Buttons type='button' variant='outline' size='sm' className='rounded-full' onClick={() => copy(providerInfo.webhook_url)}>
                          <HiOutlineClipboardDocument className='h-4 w-4' aria-hidden='true' />
                          {tf("copy")}
                        </Buttons>
                      </div>
                      <span className='text-xs text-muted-foreground'>{tf(`webhookHint.${provider ?? "SANDBOX"}`)}</span>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </SectionCard>
          ) : null}

          <SectionCard
            id='pm-rules'
            icon={HiOutlineCheckCircle}
            title={tf("rules")}
            hint={tf("rulesHint")}
            state={sections.find((s) => s.id === "pm-rules")?.state}
            stateLabel={stateLabel(sections.find((s) => s.id === "pm-rules")?.state ?? "optional")}>
            <div className='col-span-12 grid gap-3 md:grid-cols-2'>
              <ToggleRow
                id='pm-requires-reference'
                label={t("fields.requiresReference")}
                description={tf("requiresReferenceHint")}
                checked={Boolean(values.requires_reference)}
                disabled={kind === "GATEWAY"}
                onChange={(checked) => setValue("requires_reference", checked, dirty)}
              />
              <ToggleRow
                id='pm-allows-change'
                label={t("fields.allowsChange")}
                description={KINDS_WITH_CHANGE.includes(kind) ? tf("allowsChangeHint") : tf("allowsChangeOnlyCash")}
                checked={Boolean(values.allows_change)}
                disabled={!KINDS_WITH_CHANGE.includes(kind)}
                onChange={(checked) => setValue("allows_change", checked, dirty)}
              />
            </div>
            {changeError ? <p className='col-span-12 text-sm text-destructive'>{changeError}</p> : null}
            <FormField
              controller={{ control, name: "min_amount" }}
              type='number'
              min={0}
              step='1'
              label={t("fields.minAmount")}
              description={tf("minAmountHint")}
              prefix='$'
              className='col-span-12 sm:col-span-6'
            />
            <FormField
              controller={{ control, name: "max_amount" }}
              type='number'
              min={0}
              step='1'
              label={t("fields.maxAmount")}
              description={tf("maxAmountHint")}
              prefix='$'
              className='col-span-12 sm:col-span-6'
            />
          </SectionCard>

          <SectionCard
            id='pm-fee'
            icon={HiOutlineReceiptPercent}
            title={tf("fee")}
            hint={tf("feeHint")}
            state={sections.find((s) => s.id === "pm-fee")?.state}
            stateLabel={stateLabel(sections.find((s) => s.id === "pm-fee")?.state ?? "optional")}>
            <FormField
              controller={{ control, name: "fee_percent" }}
              type='number'
              min={0}
              max={100}
              step='0.01'
              label={t("fields.feePercent")}
              suffix='%'
              className='col-span-12 sm:col-span-6'
            />
            <FormField
              controller={{ control, name: "fee_fixed" }}
              type='number'
              min={0}
              step='1'
              label={t("fields.feeFixed")}
              prefix='$'
              className='col-span-12 sm:col-span-6'
            />
            <p className='col-span-12 rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground'>
              {sampleFee > 0
                ? tf("feeExample", {
                    amount: formatMoney(SAMPLE_AMOUNT),
                    fee: formatMoney(sampleFee),
                    net: formatMoney(SAMPLE_AMOUNT - sampleFee),
                  })
                : tf("feeNone")}
            </p>
          </SectionCard>

          <SectionCard
            id='pm-publish'
            icon={HiOutlineEye}
            title={tf("publish")}
            hint={tf("publishHint")}
            state={sections.find((s) => s.id === "pm-publish")?.state}
            stateLabel={stateLabel(sections.find((s) => s.id === "pm-publish")?.state ?? "optional")}>
            <div className='col-span-12 md:col-span-8'>
              <ToggleRow
                id='pm-active'
                label={t("fields.active")}
                description={tf("activeHint")}
                checked={Boolean(values.active)}
                onChange={(checked) => setValue("active", checked, dirty)}
              />
            </div>
            <FormField
              controller={{ control, name: "position" }}
              type='number'
              min={0}
              step='1'
              label={t("fields.position")}
              description={tf("positionHint")}
              className='col-span-12 md:col-span-4'
            />
          </SectionCard>

          <SectionCard
            id='pm-instructions'
            icon={HiOutlineClipboardDocument}
            title={tf("instructions")}
            hint={tf("instructionsHint")}
            state={sections.find((s) => s.id === "pm-instructions")?.state}
            stateLabel={stateLabel(sections.find((s) => s.id === "pm-instructions")?.state ?? "optional")}>
            <FormTextAreaField
              controller={{ control, name: "instructions" }}
              aria-label={tf("instructions")}
              placeholder={tf(`instructionsPlaceholder.${kind}`)}
              rows={3}
              className='col-span-12'
            />
          </SectionCard>
        </div>

        <aside className='grid content-start gap-4 lg:sticky lg:top-20'>
          <section className='grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm'>
            <h3 className='text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground'>{tf("preview")}</h3>
            <p className='text-xs text-muted-foreground'>{tf("previewHint")}</p>
            <div className={cn("flex gap-3 rounded-xl border p-3", values.active ? "border-primary/40 bg-primary/5" : "border-dashed border-border opacity-70")}>
              <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
                {(() => {
                  const Icon = KIND_ICONS[kind] ?? HiOutlineBanknotes;
                  return <Icon className='h-5 w-5' aria-hidden='true' />;
                })()}
              </span>
              <span className='min-w-0'>
                <span className='block truncate text-sm font-semibold text-foreground'>{values.name?.trim() || tf("namePlaceholder")}</span>
                <span className='block truncate text-xs text-muted-foreground'>
                  {values.description?.trim() || t(`kindHints.${kind}`)}
                </span>
              </span>
            </div>
            <dl className='grid gap-2 text-sm'>
              <div className='flex justify-between gap-2'>
                <dt className='text-muted-foreground'>{t("fields.channel")}</dt>
                <dd className='font-medium'>{t(`channels.${channel}`)}</dd>
              </div>
              <div className='flex justify-between gap-2'>
                <dt className='text-muted-foreground'>{t("fields.kind")}</dt>
                <dd className='font-medium'>{t(`kinds.${kind}`)}</dd>
              </div>
              {kind === "GATEWAY" && provider ? (
                <div className='flex justify-between gap-2'>
                  <dt className='text-muted-foreground'>{t("fields.provider")}</dt>
                  <dd className='font-medium'>{t(`providers.${provider}`)}</dd>
                </div>
              ) : null}
              <div className='flex justify-between gap-2'>
                <dt className='text-muted-foreground'>{tf("limits")}</dt>
                <dd className='text-right font-medium tabular-nums'>
                  {minAmount == null && maxAmount == null
                    ? tf("noLimits")
                    : `${minAmount != null ? formatMoney(minAmount) : "—"} – ${maxAmount != null ? formatMoney(maxAmount) : "—"}`}
                </dd>
              </div>
              <div className='flex justify-between gap-2'>
                <dt className='text-muted-foreground'>{tf("fee")}</dt>
                <dd className='font-medium tabular-nums'>
                  {feePercent || feeFixed ? `${feePercent}% + ${formatMoney(feeFixed)}` : tf("feeZero")}
                </dd>
              </div>
            </dl>
            <ul className='grid gap-1 text-xs text-muted-foreground'>
              {values.requires_reference ? <li>• {tf("previewReference")}</li> : null}
              {values.allows_change ? <li>• {tf("previewChange")}</li> : null}
              {kind === "GATEWAY" ? <li>• {tf("previewLink")}</li> : null}
              {kind === "BANK_TRANSFER" || kind === "DIGITAL_WALLET" ? <li>• {tf("previewConfirm")}</li> : null}
            </ul>
            {values.instructions?.trim() ? (
              <p className='whitespace-pre-line rounded-lg border border-border bg-muted/30 p-2 text-xs'>{values.instructions}</p>
            ) : null}
            <p className='font-mono text-xs text-muted-foreground'>{values.code || "CODIGO"}</p>
          </section>

          {!isNew ? (
            <section className='grid gap-1 rounded-2xl border border-border bg-card p-4 text-sm shadow-sm'>
              <h3 className='text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground'>{tf("usage")}</h3>
              <p className='text-2xl font-semibold tabular-nums'>{paymentsCount}</p>
              <p className='text-xs text-muted-foreground'>{paymentsCount > 0 ? tf("usageHint") : tf("usageNone")}</p>
              {paymentsCount > 0 ? (
                <Link href='/ventas/payments' className='text-xs font-medium text-primary underline-offset-4 hover:underline'>
                  {tf("viewPayments")}
                </Link>
              ) : null}
            </section>
          ) : null}
        </aside>
      </div>

      <ActionBar message={isDirty ? tf("unsaved") : undefined}>
        <Link
          href={cancelHref}
          className='inline-flex h-10 items-center rounded-full border border-border px-5 text-sm font-medium text-foreground hover:bg-muted'>
          {tCommon("cancel")}
        </Link>
        <Buttons type='submit' loading={isSubmitting} className='rounded-full'>
          {submitLabel ?? tCommon("save")}
        </Buttons>
      </ActionBar>
    </form>
  );
};
