import { create_brand_action, update_brand_action, delete_brand_action } from '@/server';

import type { IBrandAddRequest, IBrandUpdateRequest } from '../models/brand.interface';

export type ServiceResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

function normalize_error(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return 'Ocurrió un error inesperado. Intenta nuevamente.';
}

export async function create_brand_service(
  payload: IBrandAddRequest,
): Promise<ServiceResult<{ id?: number }>> {
  try {
    const result = await create_brand_action(payload);
    if (!result.success) {
      return { success: false, error: result.error ?? 'No se pudo crear la marca.' };
    }
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: normalize_error(error) };
  }
}

export async function update_brand_service(
  payload: IBrandUpdateRequest,
): Promise<ServiceResult> {
  try {
    const result = await update_brand_action(payload);
    if (!result.success) {
      return { success: false, error: result.error ?? 'No se pudo actualizar la marca.' };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: normalize_error(error) };
  }
}

export async function delete_brand_service(id: number): Promise<ServiceResult> {
  try {
    const result = await delete_brand_action({ id });
    if (!result.success) {
      return { success: false, error: result.error ?? 'No se pudo eliminar la marca.' };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: normalize_error(error) };
  }
}
