/** @format */

"use client";

import { useTranslations } from "next-intl";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ReceiptWidth } from "../models/cash.interface";

export interface TicketLine {
  name: string;
  quantity: number;
  total: number;
  discount?: number;
}

export interface TicketData {
  storeName?: string;
  address?: string;
  city?: string;
  phone?: string;
  header?: string;
  footer?: string;
  registerName?: string;
  cashier?: string;
  orderId?: number | string;
  date?: string;
  lines: TicketLine[];
  total: number;
  tax?: number;
  payments?: { name: string; amount: number }[];
  change?: number;
  invoiceNumber?: string;
}

/**
 * Ticket de venta de mostrador (58 u 80 mm): encabezado del punto de venta, líneas, totales,
 * pagos y pie. Sirve de vista previa en la configuración y se imprime desde el POS.
 */
export const TicketPreview = ({ data, width = "80MM", className }: { data: TicketData; width?: ReceiptWidth; className?: string }) => {
  const t = useTranslations("Administre.cash.ticket");
  return (
    <div
      className={cn(
        "pos-receipt mx-auto grid gap-2 bg-white p-3 font-mono text-[11px] leading-tight text-black shadow-sm",
        width === "58MM" ? "w-[58mm]" : "w-[80mm]",
        className,
      )}
      data-width={width}>
      <div className='text-center'>
        <p className='text-[13px] font-bold'>{data.storeName || t("storePlaceholder")}</p>
        {data.address || data.city ? <p>{[data.address, data.city].filter(Boolean).join(" · ")}</p> : null}
        {data.phone ? <p>{t("phone", { phone: data.phone })}</p> : null}
        {data.header ? <p className='mt-1 whitespace-pre-line'>{data.header}</p> : null}
      </div>
      <div className='border-y border-dashed border-black py-1'>
        <div className='flex justify-between gap-2'>
          <span>{data.registerName ?? ""}</span>
          <span>{data.date ?? ""}</span>
        </div>
        {data.orderId != null || data.cashier ? (
          <div className='flex justify-between gap-2'>
            <span>{data.orderId != null ? t("order", { id: data.orderId }) : ""}</span>
            <span>{data.cashier ?? ""}</span>
          </div>
        ) : null}
      </div>
      <ul className='grid gap-1'>
        {data.lines.map((line, index) => (
          <li key={`${line.name}-${index}`}>
            <p className='truncate'>{line.name}</p>
            <div className='flex justify-between gap-2'>
              <span>
                {line.quantity} ×{line.discount ? ` (−${formatMoney(line.discount)})` : ""}
              </span>
              <span>{formatMoney(line.total)}</span>
            </div>
          </li>
        ))}
      </ul>
      <div className='grid gap-0.5 border-t border-dashed border-black pt-1'>
        <div className='flex justify-between text-[13px] font-bold'>
          <span>{t("total")}</span>
          <span>{formatMoney(data.total)}</span>
        </div>
        {data.tax != null ? (
          <div className='flex justify-between'>
            <span>{t("taxIncluded")}</span>
            <span>{formatMoney(data.tax)}</span>
          </div>
        ) : null}
        {(data.payments ?? []).map((payment, index) => (
          <div key={`${payment.name}-${index}`} className='flex justify-between'>
            <span>{payment.name}</span>
            <span>{formatMoney(payment.amount)}</span>
          </div>
        ))}
        {data.change ? (
          <div className='flex justify-between font-bold'>
            <span>{t("change")}</span>
            <span>{formatMoney(data.change)}</span>
          </div>
        ) : null}
      </div>
      {data.invoiceNumber ? <p className='text-center'>{t("invoice", { number: data.invoiceNumber })}</p> : null}
      {data.footer ? <p className='whitespace-pre-line border-t border-dashed border-black pt-1 text-center'>{data.footer}</p> : null}
    </div>
  );
};

/** Estilos de impresión: solo el ticket, al ancho del papel. */
export const TicketPrintStyles = ({ width = "80MM" }: { width?: ReceiptWidth }) => (
  <style>{`@media print {
  @page { size: ${width === "58MM" ? "58mm" : "80mm"} auto; margin: 0; }
  body * { visibility: hidden !important; }
  .pos-receipt-print, .pos-receipt-print * { visibility: visible !important; }
  .pos-receipt-print { position: absolute; left: 0; top: 0; }
  .pos-receipt-print .pos-receipt { box-shadow: none; }
}`}</style>
);
