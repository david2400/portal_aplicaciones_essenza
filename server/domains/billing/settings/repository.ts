import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { billing_tags } from '@/server/lib/cache-tags';
import type { BillingSettingsDto, SaveBillingSettingsDto } from './types';

const base_path = '/api/shop/billing/settings';

export const billing_settings_repository = {
  async get_billing_settings(): Promise<BillingSettingsDto> {
    return server_fetch.get<BillingSettingsDto>(base_path, { revalidate: 0, tags: [billing_tags.settings()] });
  },
  async update_billing_settings(payload: SaveBillingSettingsDto): Promise<BillingSettingsDto> {
    return server_fetch.put<BillingSettingsDto>(base_path, payload, { revalidate: false });
  },
} as const;
