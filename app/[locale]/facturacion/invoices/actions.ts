'use server';

import {
  credit_note_action,
  get_order_invoices_action,
  issue_invoice_action,
  retry_invoice_action,
} from '@/server/domains/billing/invoices/actions';
import type { InvoiceDto, IssueInvoiceDto } from '@/server/domains/billing/invoices/types';

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

const fail = (result: { error?: string }, fallback: string): ActionResult<never> => ({
  success: false,
  error: result.error ?? fallback,
});

export async function issueInvoiceServerAction(payload: IssueInvoiceDto): Promise<ActionResult<InvoiceDto>> {
  const result = await issue_invoice_action(payload);
  return result.success ? { success: true, data: result.data } : fail(result, 'No se pudo emitir la factura');
}

export async function retryInvoiceServerAction(id: number): Promise<ActionResult<InvoiceDto>> {
  const result = await retry_invoice_action(id);
  return result.success ? { success: true, data: result.data } : fail(result, 'No se pudo reenviar el documento');
}

export async function creditNoteServerAction(id: number, reason: string): Promise<ActionResult<InvoiceDto>> {
  const result = await credit_note_action(id, { reason });
  return result.success ? { success: true, data: result.data } : fail(result, 'No se pudo emitir la nota crédito');
}

export async function getOrderInvoicesServerAction(orderId: number): Promise<ActionResult<InvoiceDto[]>> {
  const result = await get_order_invoices_action(orderId);
  return result.success ? { success: true, data: result.data } : fail(result, 'No se pudieron consultar las facturas');
}
