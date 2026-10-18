/** @format */

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Buttons } from "@repo/ui/buttons/scenes";
import { HiOutlineArrowLeft, HiOutlinePrinter } from "react-icons/hi2";
import { Segmented } from "@/components/form-sections";
import { formatApiDate, formatLocalDate, formatNumber } from "@/lib/format";
import { Link } from "@/shared/i18n/routing";
import { formatMoney } from "../constants";
import { ORDERS_HREF, type IOrder, type IOrderItem } from "../models/order.interface";

export interface IOrderPrintIssuer {
  legal_name?: string;
  trade_name?: string;
  nit?: string;
  dv?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
}

// Al imprimir solo se ve el documento (el resto del panel queda oculto).
const PRINT_CSS = `@media print {
  body * { visibility: hidden !important; }
  #order-print, #order-print * { visibility: visible !important; }
  #order-print { position: absolute; inset: 0 auto auto 0; width: 100%; box-shadow: none !important; border: 0 !important; }
  @page { margin: 14mm; }
}`;

/**
 * Documento imprimible de la orden: orden de pedido para el cliente (con precios) o lista
 * de preparación para bodega (sin precios, con casillas y unidades preparadas).
 */
export const OrderPrint = ({ order, items, issuer }: { order: IOrder; items: IOrderItem[]; issuer?: IOrderPrintIssuer | null }) => {
  const t = useTranslations("Administre.order");
  const tp = useTranslations("Administre.order.print");
  const tOpt = useTranslations("Administre.order.options");
  const tStates = useTranslations("Administre.order.states");
  const [kind, setKind] = useState<"order" | "picking">("order");
  const pickup = order.delivery_method === "PICKUP";
  const units = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  const company = issuer?.trade_name || issuer?.legal_name;

  return (
    <section className='flex w-full flex-col gap-4'>
      <style>{PRINT_CSS}</style>
      <div className='flex flex-wrap items-center justify-between gap-3 print:hidden'>
        <Link href={`${ORDERS_HREF}/${order.id}`} className='inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground'>
          <HiOutlineArrowLeft className='h-4 w-4' aria-hidden='true' />
          {tp("back")}
        </Link>
        <div className='flex flex-wrap items-center gap-3'>
          <Segmented label={tp("document")} value={kind} onChange={setKind}
            options={[
              { value: "order", label: tp("orderDoc") },
              { value: "picking", label: tp("pickingDoc") },
            ]} />
          <Buttons type='button' className='rounded-full' onClick={() => window.print()}>
            <HiOutlinePrinter className='h-4 w-4' aria-hidden='true' />
            {tp("print")}
          </Buttons>
        </div>
      </div>

      <article id='order-print' className='mx-auto w-full max-w-3xl rounded-2xl border border-border bg-white p-8 text-sm text-neutral-900 shadow-sm'>
        <header className='flex flex-wrap items-start justify-between gap-4 border-b border-neutral-300 pb-4'>
          <div>
            {company ? <p className='text-lg font-semibold'>{company}</p> : null}
            {issuer?.nit ? <p className='text-xs text-neutral-600'>NIT {issuer.nit}{issuer.dv ? `-${issuer.dv}` : ""}</p> : null}
            <p className='text-xs text-neutral-600'>{[issuer?.address, issuer?.city].filter(Boolean).join(", ")}</p>
            <p className='text-xs text-neutral-600'>{[issuer?.phone, issuer?.email].filter(Boolean).join(" · ")}</p>
          </div>
          <div className='text-right'>
            <p className='text-xs uppercase tracking-[0.14em] text-neutral-500'>{kind === "order" ? tp("orderDoc") : tp("pickingDoc")}</p>
            <p className='text-2xl font-bold'>{order.order_number ?? `#${order.id}`}</p>
            <p className='text-xs text-neutral-600'>{order.created_at ? formatApiDate(order.created_at) : ""}</p>
            <p className='text-xs text-neutral-600'>{order.state ? tStates(order.state as never) : ""}</p>
          </div>
        </header>

        <div className='grid gap-4 border-b border-neutral-300 py-4 sm:grid-cols-2'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500'>{tp("customer")}</p>
            <p className='font-medium'>{order.customer_name ?? "—"}</p>
            {order.customer_doc_number ? <p>{[order.customer_doc_type, order.customer_doc_number].filter(Boolean).join(" ")}</p> : null}
            <p>{[order.customer_phone, order.customer_email].filter(Boolean).join(" · ")}</p>
            {order.billing_address ? <p>{[order.billing_address, order.billing_city].filter(Boolean).join(", ")}</p> : null}
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500'>
              {pickup ? tOpt("deliveryMethods.PICKUP") : tOpt("deliveryMethods.SHIPPING")}
            </p>
            {pickup ? (
              <p className='font-medium'>{order.pickup_store_name ?? "—"}</p>
            ) : (
              <>
                <p className='font-medium'>{order.recipient_name ?? "—"}</p>
                <p>{[order.ship_address, order.ship_address_detail].filter(Boolean).join(" · ")}</p>
                <p>{[order.ship_city, order.ship_state, order.ship_postal_code].filter(Boolean).join(", ")}</p>
              </>
            )}
            {order.recipient_phone ? <p>{order.recipient_phone}</p> : null}
            {order.carrier_name ? <p>{t("fields.carrier")}: {order.carrier_name}{order.tracking_number ? ` · ${order.tracking_number}` : ""}</p> : null}
            {order.promised_date ? <p>{t("fields.promisedDate")}: {formatLocalDate(order.promised_date)}</p> : null}
          </div>
        </div>

        <table className='mt-4 w-full border-collapse text-sm'>
          <thead>
            <tr className='border-b border-neutral-400 text-left text-xs uppercase tracking-wide text-neutral-500'>
              {kind === "picking" ? <th className='w-8 py-2'><span className='sr-only'>{tp("check")}</span></th> : null}
              <th className='py-2'>{t("items.fields.productId")}</th>
              <th className='py-2'>SKU</th>
              <th className='py-2 text-right'>{t("items.fields.quantity")}</th>
              {kind === "order" ? (
                <>
                  <th className='py-2 text-right'>{t("items.fields.unitPrice")}</th>
                  <th className='py-2 text-right'>{t("items.fields.discount")}</th>
                  <th className='py-2 text-right'>{t("items.fields.total")}</th>
                </>
              ) : (
                <th className='py-2 text-right'>{tp("picked")}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className='border-b border-neutral-200'>
                {kind === "picking" ? <td className='py-2'><span className='inline-block h-4 w-4 rounded border border-neutral-500' /></td> : null}
                <td className='py-2'>{item.product_name ?? `#${item.product_id}`}</td>
                <td className='py-2 font-mono text-xs'>{item.sku_code}</td>
                <td className='py-2 text-right tabular-nums'>{formatNumber(item.quantity ?? 0)}</td>
                {kind === "order" ? (
                  <>
                    <td className='py-2 text-right tabular-nums'>{formatMoney(item.unit_price)}</td>
                    <td className='py-2 text-right tabular-nums'>{formatMoney((item.discount ?? 0) + (item.order_discount ?? 0))}</td>
                    <td className='py-2 text-right tabular-nums'>{formatMoney(item.total)}</td>
                  </>
                ) : (
                  <td className='py-2 text-right tabular-nums'>{item.picked_quantity ?? 0}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {kind === "order" ? (
          <dl className='ml-auto mt-4 grid w-full max-w-xs grid-cols-[minmax(0,1fr)_auto] gap-x-6 gap-y-1'>
            {(order.discount_amount ?? 0) > 0 ? (
              <>
                <dt className='text-neutral-600'>{order.coupon_code ? tp("coupon", { code: order.coupon_code }) : tp("discount")}</dt>
                <dd className='text-right tabular-nums'>− {formatMoney(order.discount_amount)}</dd>
              </>
            ) : null}
            {(order.shipping_amount ?? 0) > 0 ? (
              <>
                <dt className='text-neutral-600'>{t("fields.shippingAmount")}</dt>
                <dd className='text-right tabular-nums'>{formatMoney(Math.max((order.shipping_amount ?? 0) - (order.shipping_discount ?? 0), 0))}</dd>
              </>
            ) : null}
            <dt className='text-neutral-600'>{t("fields.netAmount")}</dt>
            <dd className='text-right tabular-nums'>{formatMoney(order.net_amount ?? order.total)}</dd>
            <dt className='text-neutral-600'>{t("fields.taxes")}</dt>
            <dd className='text-right tabular-nums'>{formatMoney(order.tax_amount ?? 0)}</dd>
            <dt className='border-t border-neutral-400 pt-1 font-semibold'>{t("fields.total")}</dt>
            <dd className='border-t border-neutral-400 pt-1 text-right font-semibold tabular-nums'>{formatMoney(order.total)}</dd>
          </dl>
        ) : (
          <p className='mt-4 text-right text-sm'>{tp("totalUnits", { count: formatNumber(units) })}</p>
        )}

        {order.customer_notes ? (
          <div className='mt-6 rounded-lg border border-neutral-300 p-3'>
            <p className='text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500'>{t("fields.customerNotes")}</p>
            <p className='whitespace-pre-line'>{order.customer_notes}</p>
          </div>
        ) : null}
        {kind === "picking" && (order.internal_notes || order.delivery_notes) ? (
          <div className='mt-4 rounded-lg border border-neutral-300 p-3'>
            <p className='text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500'>{tp("instructions")}</p>
            <p className='whitespace-pre-line'>{[order.internal_notes, order.delivery_notes].filter(Boolean).join("\n")}</p>
          </div>
        ) : null}

        <footer className='mt-10 grid gap-8 text-xs text-neutral-600 sm:grid-cols-2'>
          <div className='border-t border-neutral-400 pt-1'>{kind === "picking" ? tp("preparedBy") : tp("deliveredBy")}</div>
          <div className='border-t border-neutral-400 pt-1'>{kind === "picking" ? tp("checkedBy") : tp("receivedBy")}</div>
        </footer>
      </article>
    </section>
  );
};
