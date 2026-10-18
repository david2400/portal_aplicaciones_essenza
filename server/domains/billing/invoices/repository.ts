import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { to_list } from '@/server/lib/list-response';
import { billing_tags } from '@/server/lib/cache-tags';
import { to_page_result, to_search_params } from '@/server/lib/pagination';
import type { GridQuery, PageResult } from '@/shared/models/pagination';
import type { CreditNoteDto, InvoiceDto, InvoicesSummaryDto, IssueInvoiceDto } from './types';

const base_path = '/api/shop/billing/invoices';

const filter_params = (query: Pick<GridQuery, 'q' | 'filters'>) => {
  const search = new URLSearchParams();
  if (query.q) search.set('q', query.q);
  for (const key of ['kind', 'status', 'orderId', 'from', 'to'] as const) {
    if (query.filters[key]) search.set(key, query.filters[key]);
  }
  return search;
};

export const invoices_repository = {
  async search_invoices(query: GridQuery): Promise<PageResult<InvoiceDto>> {
    const response = await server_fetch.get<unknown>(`${base_path}?${to_search_params(query)}`, {
      revalidate: 0,
      tags: [billing_tags.invoices()],
    });
    return to_page_result<InvoiceDto>(response, query.size);
  },
  async summarize_invoices(query: Pick<GridQuery, 'q' | 'filters'>): Promise<InvoicesSummaryDto> {
    return server_fetch.get<InvoicesSummaryDto>(`${base_path}/summary?${filter_params(query)}`, {
      revalidate: 0,
      tags: [billing_tags.invoices()],
    });
  },
  async get_invoice(id: number): Promise<InvoiceDto> {
    return server_fetch.get<InvoiceDto>(`${base_path}/${id}`, { revalidate: 0, tags: [billing_tags.invoices()] });
  },
  async get_order_invoices(order_id: number): Promise<InvoiceDto[]> {
    const response = await server_fetch.get<unknown>(`/api/shop/billing/orders/${order_id}/invoices`, {
      revalidate: 0,
      tags: [billing_tags.order_invoices(order_id)],
    });
    return to_list<InvoiceDto>(response);
  },
  async issue_invoice(payload: IssueInvoiceDto): Promise<InvoiceDto> {
    return server_fetch.post<InvoiceDto>(base_path, payload, { revalidate: false });
  },
  async retry_invoice(id: number): Promise<InvoiceDto> {
    return server_fetch.post<InvoiceDto>(`${base_path}/${id}/retry`, undefined, { revalidate: false });
  },
  async credit_note(id: number, payload: CreditNoteDto): Promise<InvoiceDto> {
    return server_fetch.post<InvoiceDto>(`${base_path}/${id}/credit_note`, payload, { revalidate: false });
  },
} as const;
