import 'server-only';

import { cache } from 'react';

import type { GridQuery } from '@/shared/models/pagination';
import { invoices_repository } from './repository';

export const search_invoices = cache(async (query: GridQuery) => invoices_repository.search_invoices(query));

export const summarize_invoices = cache(async (query: GridQuery) => invoices_repository.summarize_invoices(query));

export const get_invoice = cache(async ({ id }: { id: number }) => invoices_repository.get_invoice(id));

export const get_order_invoices = cache(async ({ order_id }: { order_id: number }) =>
  invoices_repository.get_order_invoices(order_id),
);
