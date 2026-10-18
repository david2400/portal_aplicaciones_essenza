import 'server-only';

import { cache } from 'react';

import { payments_repository } from './repository';
import type { GridQuery } from '@/shared/models/pagination';

export const search_payments = cache(async (query: GridQuery) => payments_repository.search_payments(query));

export const summarize_payments = cache(async (query: GridQuery) => payments_repository.summarize_payments(query));

export const get_order_payments = cache(async ({ order_id }: { order_id: number }) =>
  payments_repository.get_order_payments(order_id),
);
