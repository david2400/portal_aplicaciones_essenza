import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { to_list } from '@/server/lib/list-response';
import { billing_tags } from '@/server/lib/cache-tags';
import type { SaveTaxRateDto, TaxRateDto } from './types';

const base_path = '/api/shop/billing/tax_rates';

export const tax_rates_repository = {
  async list_tax_rates(include_inactive = true): Promise<TaxRateDto[]> {
    const response = await server_fetch.get<unknown>(`${base_path}?includeInactive=${include_inactive}`, {
      revalidate: 60,
      tags: [billing_tags.tax_rates()],
    });
    return to_list<TaxRateDto>(response);
  },
  async create_tax_rate(payload: SaveTaxRateDto): Promise<TaxRateDto> {
    return server_fetch.post<TaxRateDto>(base_path, payload, { revalidate: false });
  },
  async update_tax_rate(id: number, payload: SaveTaxRateDto): Promise<TaxRateDto> {
    return server_fetch.put<TaxRateDto>(`${base_path}/${id}`, payload, { revalidate: false });
  },
  async delete_tax_rate(id: number): Promise<void> {
    return server_fetch.delete<void>(`${base_path}/${id}`, { revalidate: false });
  },
} as const;
