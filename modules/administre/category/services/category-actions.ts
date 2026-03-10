import { create_category_action, update_category_action, delete_category_action } from '@/server';

import type { ICategoryAddRequest, ICategoryUpdateRequest } from '../models/category.interface';

export type ServiceResult<T = void> =
  | { success: true; data?: T }

export async function update_category_service(
  payload: ICategoryUpdateRequest,
): Promise<ServiceResult> {
  try {
    const result = await update_category_action(payload);
    if (!result.success) {
      return { success: false, error: result.error ?? 'No se pudo actualizar la categoría.' };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: normalize_error(error) };
  }
}

export async function delete_category_service(id: number): Promise<ServiceResult> {
  try {
    const result = await delete_category_action({ id });
    if (!result.success) {
      return { success: false, error: result.error ?? 'No se pudo eliminar la categoría.' };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: normalize_error(error) };
  }
}
  | { success: false; error: string };

function normalize_error(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return 'Ocurrió un error inesperado. Intenta nuevamente.';
}

export async function create_category_service(
  payload: ICategoryAddRequest,
): Promise<ServiceResult<{ id?: number }>> {
  try {
    const result = await create_category_action(payload);
    if (!result.success) {
      return { success: false, error: result.error ?? 'No se pudo crear la categoría.' };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: normalize_error(error) };
  }
}
