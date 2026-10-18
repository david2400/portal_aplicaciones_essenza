'use server';

import {
  create_tax_rate_action,
  delete_tax_rate_action,
  update_tax_rate_action,
} from '@/server/domains/billing/tax-rates/actions';
import type { SaveTaxRateDto, TaxRateDto } from '@/server/domains/billing/tax-rates/types';

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

const fail = (result: { error?: string }, fallback: string): ActionResult<never> => ({
  success: false,
  error: result.error ?? fallback,
});

export async function createTaxRateServerAction(payload: SaveTaxRateDto): Promise<ActionResult<TaxRateDto>> {
  const result = await create_tax_rate_action(payload);
  return result.success ? { success: true, data: result.data } : fail(result, 'No se pudo crear la tarifa');
}

export async function updateTaxRateServerAction(id: number, payload: SaveTaxRateDto): Promise<ActionResult<TaxRateDto>> {
  const result = await update_tax_rate_action(id, payload);
  return result.success ? { success: true, data: result.data } : fail(result, 'No se pudo actualizar la tarifa');
}

export async function deleteTaxRateServerAction(id: number): Promise<ActionResult> {
  const result = await delete_tax_rate_action(id);
  return result.success ? { success: true, data: undefined } : fail(result, 'No se pudo eliminar la tarifa');
}
