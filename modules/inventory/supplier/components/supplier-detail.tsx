/** @format */

"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { IconType } from "react-icons";
import {
  HiOutlineArrowLeft,
  HiOutlineBanknotes,
  HiOutlineBuildingLibrary,
  HiOutlineBuildingOffice2,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineCube,
  HiOutlineCreditCard,
  HiOutlineEnvelope,
  HiOutlineExclamationTriangle,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineIdentification,
  HiOutlineMapPin,
  HiOutlineNoSymbol,
  HiOutlinePauseCircle,
  HiOutlinePencilSquare,
  HiOutlinePhone,
  HiOutlineUserGroup,
} from "react-icons/hi2";
import { Buttons } from "@repo/ui/buttons/scenes";
import { PageHeader } from "@/components/page-header";
import { KpiStrip } from "@/components/form-sections";
import { formatMoney, formatNumber } from "@/lib/format";
import { Link } from "@/shared/i18n/routing";
import { SUPPLIERS_HREF, type ISupplier, type ISupplierProduct } from "../models/supplier.interface";
import { useSupplierStatus } from "../hooks/useSupplierStatus";
import { SupplierStatusBadge } from "./supplier-status-badge";
import { SupplierProducts } from "./supplier-products";

const Card = ({ icon: Icon, title, children, className }: { icon: IconType; title: string; children: ReactNode; className?: string }) => (
  <section className={`grid content-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm ${className ?? ""}`}>
    <h3 className='flex items-center gap-2 text-sm font-semibold'>
      <Icon className='h-4 w-4 text-muted-foreground' aria-hidden='true' />
      {title}
    </h3>
    {children}
  </section>
);

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <>
    <dt className='text-muted-foreground'>{label}</dt>
    <dd className='min-w-0 break-words text-right font-medium text-foreground'>{children ?? "—"}</dd>
  </>
);

/** Ficha del proveedor: estado, indicadores, datos fiscales y comerciales, contactos, banco y productos que surte. */
export const SupplierDetail = ({ supplier, products }: { supplier: ISupplier; products: ISupplierProduct[] }) => {
  const t = useTranslations("Administre.supplier");
  const td = useTranslations("Administre.supplier.detail");
  const tOpt = useTranslations("Administre.supplier.options");
  const tStatus = useTranslations("Administre.supplier.statusActions");
  const tCrud = useTranslations("Crud");
  const { change, busy } = useSupplierStatus();
  const [showAccount, setShowAccount] = useState(false);

  const isCash = (supplier.payment_term_days ?? 0) === 0;
  const preferred = products.filter((product) => product.preferred).length;
  const activeProducts = products.filter((product) => product.active);
  const margins = activeProducts.map((product) => product.margin_percent).filter((value): value is number => value != null);
  const avgMargin = margins.length ? margins.reduce((sum, value) => sum + value, 0) / margins.length : null;
  const website = supplier.website ? (supplier.website.startsWith("http") ? supplier.website : `https://${supplier.website}`) : null;
  const working = busy === supplier.id;

  return (
    <section className='flex w-full flex-col gap-6'>
      <Link href={SUPPLIERS_HREF} className='inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground'>
        <HiOutlineArrowLeft className='h-4 w-4' aria-hidden='true' />
        {td("back")}
      </Link>

      <PageHeader
        title={supplier.display_name ?? supplier.name ?? `#${supplier.id}`}
        description={[supplier.document ? `${supplier.doc_type} ${supplier.document}` : td("noDocument"), supplier.code].filter(Boolean).join(" · ")}
        icon={HiOutlineBuildingOffice2}
        eyebrow={tCrud("domains.inventory")}
        actions={
          <>
            <SupplierStatusBadge status={supplier.status} />
            {supplier.status !== "ACTIVE" ? (
              <Buttons type='button' variant='outline' className='rounded-full' loading={working} onClick={() => change(supplier, "ACTIVE")}>
                <HiOutlineCheckCircle className='h-4 w-4' aria-hidden='true' />
                {tStatus("activate")}
              </Buttons>
            ) : null}
            {supplier.status !== "BLOCKED" ? (
              <Buttons type='button' variant='outline' className='rounded-full' loading={working} onClick={() => change(supplier, "BLOCKED")}>
                <HiOutlineNoSymbol className='h-4 w-4' aria-hidden='true' />
                {tStatus("block")}
              </Buttons>
            ) : null}
            {supplier.status === "ACTIVE" ? (
              <Buttons type='button' variant='ghost' className='rounded-full' loading={working} onClick={() => change(supplier, "INACTIVE")}>
                <HiOutlinePauseCircle className='h-4 w-4' aria-hidden='true' />
                {tStatus("inactivate")}
              </Buttons>
            ) : null}
            <Link href={`${SUPPLIERS_HREF}/${supplier.id}/edit`}
              className='inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90'>
              <HiOutlinePencilSquare className='h-4 w-4' aria-hidden='true' />
              {td("edit")}
            </Link>
          </>
        }
      />

      {supplier.status === "BLOCKED" ? (
        <div role='status' className='flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm'>
          <HiOutlineExclamationTriangle className='mt-0.5 h-5 w-5 shrink-0 text-destructive' aria-hidden='true' />
          <div>
            <p className='font-medium text-destructive'>{td("blockedTitle")}</p>
            <p className='text-muted-foreground'>{supplier.block_reason}</p>
          </div>
        </div>
      ) : null}
      {!supplier.document ? (
        <div role='status' className='flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm'>
          <p className='text-amber-900 dark:text-amber-200'>{td("missingDocument")}</p>
          <Link href={`${SUPPLIERS_HREF}/${supplier.id}/edit`} className='font-medium text-primary underline-offset-4 hover:underline'>
            {td("complete")}
          </Link>
        </div>
      ) : null}

      <KpiStrip
        items={[
          {
            label: t("fields.paymentTerm"),
            value: isCash ? tOpt("cash") : tOpt("days", { days: supplier.payment_term_days ?? 0 }),
            hint: isCash ? undefined : td("credit"),
            icon: HiOutlineCreditCard,
          },
          {
            label: t("fields.creditLimit"),
            value: supplier.credit_limit != null ? formatMoney(supplier.credit_limit) : "—",
            hint: supplier.currency ?? undefined,
            icon: HiOutlineBanknotes,
          },
          {
            label: t("fields.leadTime"),
            value: supplier.lead_time_days != null ? tOpt("days", { days: supplier.lead_time_days }) : "—",
            icon: HiOutlineClock,
          },
          {
            label: td("products"),
            value: formatNumber(activeProducts.length),
            hint:
              avgMargin != null
                ? td("productsHint", { preferred, margin: formatNumber(Math.round(avgMargin * 10) / 10) })
                : undefined,
            icon: HiOutlineCube,
          },
        ]}
      />

      <div className='grid gap-4 lg:grid-cols-3'>
        <Card icon={HiOutlineIdentification} title={td("fiscal")}>
          <dl className='grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-sm'>
            <Row label={supplier.person_type === "NATURAL" ? t("fields.fullName") : t("fields.legalName")}>{supplier.name}</Row>
            {supplier.trade_name ? <Row label={t("fields.tradeName")}>{supplier.trade_name}</Row> : null}
            <Row label={t("fields.docNumber")}>
              {supplier.document ? <span className='font-mono tabular-nums'>{`${supplier.doc_type} ${supplier.document}`}</span> : null}
            </Row>
            <Row label={t("fields.personType")}>{supplier.person_type ? tOpt(`personTypes.${supplier.person_type}` as never) : null}</Row>
            <Row label={t("fields.taxRegime")}>{supplier.tax_regime ? tOpt(`regimes.${supplier.tax_regime}` as never) : null}</Row>
          </dl>
          {supplier.great_contributor || supplier.self_retainer ? (
            <div className='flex flex-wrap gap-1.5'>
              {supplier.great_contributor ? <span className='rounded-full bg-muted px-2 py-0.5 text-xs'>{t("fields.greatContributor")}</span> : null}
              {supplier.self_retainer ? <span className='rounded-full bg-muted px-2 py-0.5 text-xs'>{t("fields.selfRetainer")}</span> : null}
            </div>
          ) : null}
        </Card>

        <Card icon={HiOutlineMapPin} title={td("contact")}>
          <ul className='grid gap-2 text-sm'>
            <li className='flex items-center gap-2'>
              <HiOutlineEnvelope className='h-4 w-4 shrink-0 text-muted-foreground' aria-hidden='true' />
              {supplier.email ? <a href={`mailto:${supplier.email}`} className='truncate text-primary hover:underline'>{supplier.email}</a> : "—"}
            </li>
            <li className='flex items-center gap-2'>
              <HiOutlinePhone className='h-4 w-4 shrink-0 text-muted-foreground' aria-hidden='true' />
              {supplier.phone ? <a href={`tel:${supplier.phone}`} className='hover:underline'>{supplier.phone}</a> : "—"}
            </li>
            <li className='flex items-start gap-2'>
              <HiOutlineMapPin className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground' aria-hidden='true' />
              <span>{[supplier.address, supplier.city].filter(Boolean).join(", ") || "—"}</span>
            </li>
            {website ? (
              <li className='truncate pl-6'>
                <a href={website} target='_blank' rel='noopener noreferrer' className='text-primary hover:underline'>{supplier.website}</a>
              </li>
            ) : null}
          </ul>
        </Card>

        <Card icon={HiOutlineBuildingLibrary} title={td("bank")}>
          {supplier.bank_name ? (
            <dl className='grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-sm'>
              <Row label={t("fields.bankName")}>{supplier.bank_name}</Row>
              <Row label={t("fields.accountType")}>
                {supplier.bank_account_type ? tOpt(`accountTypes.${supplier.bank_account_type}` as never) : null}
              </Row>
              <Row label={t("fields.accountNumber")}>
                <span className='inline-flex items-center gap-1.5'>
                  <span className='font-mono tabular-nums'>{showAccount ? supplier.bank_account_number : supplier.bank_account_masked}</span>
                  <button type='button' onClick={() => setShowAccount((value) => !value)}
                    aria-label={showAccount ? td("hideAccount") : td("showAccount")} aria-pressed={showAccount}
                    className='rounded p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
                    {showAccount ? <HiOutlineEyeSlash className='h-4 w-4' aria-hidden='true' /> : <HiOutlineEye className='h-4 w-4' aria-hidden='true' />}
                  </button>
                </span>
              </Row>
              <Row label={t("fields.accountHolder")}>{supplier.bank_account_holder ?? supplier.name}</Row>
              {supplier.bank_holder_document ? <Row label={t("fields.holderDocument")}>{supplier.bank_holder_document}</Row> : null}
            </dl>
          ) : (
            <p className='text-sm text-muted-foreground'>{td("noBank")}</p>
          )}
        </Card>

        <Card icon={HiOutlineUserGroup} title={td("people")} className='lg:col-span-2'>
          {supplier.contacts && supplier.contacts.length > 0 ? (
            <ul className='grid gap-2 sm:grid-cols-2'>
              {supplier.contacts.map((contact) => (
                <li key={contact.id ?? contact.name} className='rounded-xl border border-border p-3 text-sm'>
                  <div className='flex items-center justify-between gap-2'>
                    <p className='truncate font-medium'>{contact.name}</p>
                    {contact.primary ? <span className='rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary'>{td("primary")}</span> : null}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {[contact.position, contact.area ? tOpt(`areas.${contact.area}` as never) : null].filter(Boolean).join(" · ")}
                  </p>
                  <p className='mt-1 flex flex-wrap gap-x-3 text-xs'>
                    {contact.phone ? <a href={`tel:${contact.phone}`} className='hover:underline'>{contact.phone}</a> : null}
                    {contact.email ? <a href={`mailto:${contact.email}`} className='text-primary hover:underline'>{contact.email}</a> : null}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className='text-sm text-muted-foreground'>{td("noPeople")}</p>
          )}
        </Card>

        <Card icon={HiOutlineBanknotes} title={td("terms")}>
          <dl className='grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-sm'>
            <Row label={t("fields.currency")}>{supplier.currency}</Row>
            <Row label={t("fields.minOrder")}>{supplier.min_order_amount != null ? formatMoney(supplier.min_order_amount) : null}</Row>
            <Row label={t("fields.discount")}>{supplier.discount_percent != null ? `${formatNumber(supplier.discount_percent)} %` : null}</Row>
            <Row label={td("catalogProducts")}>{formatNumber(supplier.catalog_products ?? 0)}</Row>
          </dl>
          {supplier.notes ? <p className='whitespace-pre-line rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground'>{supplier.notes}</p> : null}
        </Card>
      </div>

      <SupplierProducts supplier={supplier} products={products} />
    </section>
  );
};
