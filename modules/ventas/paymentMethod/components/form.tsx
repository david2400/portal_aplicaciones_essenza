/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { notify } from "@/components/notifications";
import { FormPaymentMethod } from "../scenes/formPaymentMethod";
import type { PaymentMethodFormInput, PaymentMethodFormValues } from "../schemas/paymentMethod.schema";
import {
  isGatewayProvider,
  isPaymentChannel,
  isPaymentKind,
  type IGatewayProvider,
  type IPaymentMethod,
  type IPaymentMethodSaveRequest,
} from "../models/paymentMethod.interface";
import {
  createPaymentMethodServerAction,
  updatePaymentMethodServerAction,
} from "@/app/[locale]/ventas/payment-methods/actions";

export const PAYMENT_METHODS_HREF = "/ventas/payment-methods";

const EMPTY_VALUES = {
  name: "",
  code: "",
  description: "",
  instructions: "",
  channel: "PHYSICAL",
  kind: "CASH",
  provider: "none",
  active: true,
  position: 100,
  fee_percent: 0,
  fee_fixed: 0,
  min_amount: "",
  max_amount: "",
  requires_reference: false,
  allows_change: true,
} satisfies PaymentMethodFormInput;

const toFormValues = (item: IPaymentMethod): PaymentMethodFormInput => ({
  name: item.name ?? "",
  code: item.code ?? "",
  description: item.description ?? "",
  instructions: item.instructions ?? "",
  channel: isPaymentChannel(item.channel) ? item.channel : "PHYSICAL",
  kind: isPaymentKind(item.kind) ? item.kind : "OTHER",
  provider: isGatewayProvider(item.provider) ? item.provider : "none",
  active: item.active !== false,
  position: item.position ?? 0,
  fee_percent: item.fee_percent ?? 0,
  fee_fixed: item.fee_fixed ?? 0,
  min_amount: item.min_amount ?? "",
  max_amount: item.max_amount ?? "",
  requires_reference: Boolean(item.requires_reference),
  allows_change: Boolean(item.allows_change),
});

const toPayload = (values: PaymentMethodFormValues): IPaymentMethodSaveRequest => ({
  name: values.name,
  code: values.code || undefined,
  description: values.description || undefined,
  instructions: values.instructions || undefined,
  channel: values.channel,
  kind: values.kind,
  provider: values.kind === "GATEWAY" && values.provider && values.provider !== "none" ? values.provider : undefined,
  active: values.active,
  position: values.position,
  fee_percent: values.fee_percent,
  fee_fixed: values.fee_fixed,
  min_amount: values.min_amount,
  max_amount: values.max_amount,
  requires_reference: values.kind === "GATEWAY" ? false : values.requires_reference,
  allows_change: values.allows_change,
});

/** Alta en `/ventas/payment-methods/new`: al guardar abre el medio creado. */
export const RegisterPaymentMethod = ({ providers }: { providers: IGatewayProvider[] }) => {
  const router = useRouter();
  const t = useTranslations("Administre.paymentMethod");
  const tCommon = useTranslations("Administre.common");

  const handleSubmit = async (values: PaymentMethodFormValues) => {
    const result = await createPaymentMethodServerAction(toPayload(values));
    if (result.success) {
      notify.success(tCommon("createdSuccess"), values.name);
      router.push(PAYMENT_METHODS_HREF);
      router.refresh();
    } else {
      notify.error(tCommon("errorTitle"), result.error || tCommon("unexpectedError"));
    }
  };

  return (
    <FormPaymentMethod
      initialValues={EMPTY_VALUES}
      onSubmit={handleSubmit}
      providers={providers}
      isNew
      cancelHref={PAYMENT_METHODS_HREF}
      submitLabel={t("create")}
    />
  );
};

/** Edición en `/ventas/payment-methods/[id]`: guarda y se queda con los datos frescos. */
export const UpdatePaymentMethod = ({ method, providers }: { method: IPaymentMethod; providers: IGatewayProvider[] }) => {
  const router = useRouter();
  const tCommon = useTranslations("Administre.common");

  const handleSubmit = async (values: PaymentMethodFormValues) => {
    if (method.id == null) return;
    const result = await updatePaymentMethodServerAction(method.id, toPayload(values));
    if (result.success) {
      notify.success(tCommon("updatedSuccess"), values.name);
      router.refresh();
    } else {
      notify.error(tCommon("errorTitle"), result.error || tCommon("unexpectedError"));
    }
  };

  return (
    <FormPaymentMethod
      key={JSON.stringify(method)}
      initialValues={toFormValues(method)}
      onSubmit={handleSubmit}
      providers={providers}
      paymentsCount={method.payments_count ?? 0}
      cancelHref={PAYMENT_METHODS_HREF}
    />
  );
};
