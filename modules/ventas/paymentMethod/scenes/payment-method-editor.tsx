/** @format */

"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@repo/ui/badges/scenes/badge";
import { HiOutlineArrowLeft, HiOutlineCreditCard, HiOutlinePlusCircle } from "react-icons/hi2";
import { PageHeader } from "@/components/page-header";
import { Link } from "@/shared/i18n/routing";
import { PAYMENT_METHODS_HREF, RegisterPaymentMethod, UpdatePaymentMethod } from "../components/form";
import { isPaymentChannel, isPaymentKind, type IGatewayProvider, type IPaymentMethod } from "../models/paymentMethod.interface";

const EditorShell = ({
  title,
  description,
  icon,
  actions,
  children,
}: {
  title: string;
  description?: string;
  icon: typeof HiOutlineCreditCard;
  actions?: ReactNode;
  children: ReactNode;
}) => {
  const tf = useTranslations("Administre.paymentMethod.form");
  const tCrud = useTranslations("Crud");
  return (
    <section className='flex w-full flex-col gap-6'>
      <Link
        href={PAYMENT_METHODS_HREF}
        className='inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground'>
        <HiOutlineArrowLeft className='h-4 w-4' aria-hidden='true' />
        {tf("back")}
      </Link>
      <PageHeader title={title} description={description} icon={icon} eyebrow={tCrud("domains.sales")} actions={actions} />
      {children}
    </section>
  );
};

/** Alta de medio de pago en su propia ruta. */
export const PaymentMethodCreate = ({ providers }: { providers: IGatewayProvider[] }) => {
  const t = useTranslations("Administre.paymentMethod");
  const tf = useTranslations("Administre.paymentMethod.form");
  return (
    <EditorShell title={t("createTitle")} description={tf("createDescription")} icon={HiOutlinePlusCircle}>
      <RegisterPaymentMethod providers={providers} />
    </EditorShell>
  );
};

/** Edición de un medio de pago existente. */
export const PaymentMethodEditor = ({ method, providers }: { method: IPaymentMethod; providers: IGatewayProvider[] }) => {
  const t = useTranslations("Administre.paymentMethod");
  return (
    <EditorShell
      title={method.name ?? `#${method.id}`}
      description={[
        `#${method.id}`,
        method.code,
        isPaymentChannel(method.channel) ? t(`channels.${method.channel}`) : null,
        isPaymentKind(method.kind) ? t(`kinds.${method.kind}`) : null,
      ]
        .filter(Boolean)
        .join(" · ")}
      icon={HiOutlineCreditCard}
      actions={method.active ? <Badge variant='secondary'>{t("active")}</Badge> : <Badge variant='outline'>{t("inactive")}</Badge>}>
      <UpdatePaymentMethod method={method} providers={providers} />
    </EditorShell>
  );
};
