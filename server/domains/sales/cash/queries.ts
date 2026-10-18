import 'server-only';

import { cache } from 'react';

import type { GridQuery } from '@/shared/models/pagination';
import { cash_repository } from './repository';

export const list_stores = cache(async (include_inactive: boolean = true) => cash_repository.list_stores(include_inactive));

export const list_cash_registers = cache(async (include_inactive: boolean = true) =>
  cash_repository.list_cash_registers(include_inactive),
);

export const search_cash_sessions = cache(async (query: GridQuery) => cash_repository.search_cash_sessions(query));

export const get_cash_session = cache(async ({ id }: { id: number }) => cash_repository.get_cash_session(id));
