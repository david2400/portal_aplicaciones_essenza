'use server';

import { update_billing_settings_action } from '@/server/domains/billing/settings/actions';
import type { BillingSettingsDto, SaveBillingSettingsDto } from '@/server/domains/billing/settings/types';

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

const fail = (result: { error?: string }, fallback: string): ActionResult<never> => ({
  success: false,
  error: result.error ?? fallback,
});

export async function updateBillingSettingsServerAction(
  payload: SaveBillingSettingsDto,
): Promise<ActionResult<BillingSettingsDto>> {
  const result = await update_billing_settings_action(payload);
  return result.success ? { success: true, data: result.data } : fail(result, 'No se pudo guardar la configuración');
}
