import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type InvoiceDto = components['schemas']['InvoiceDto'];
export type InvoiceLineDto = components['schemas']['InvoiceLineDto'];
export type InvoiceTaxDto = components['schemas']['InvoiceTaxDto'];
export type BuyerDto = components['schemas']['BuyerDto'];
export type IssueInvoiceDto = components['schemas']['IssueInvoiceDto'];
export type CreditNoteDto = components['schemas']['CreditNoteDto'];
export type InvoicesSummaryDto = components['schemas']['InvoicesSummaryDto'];
