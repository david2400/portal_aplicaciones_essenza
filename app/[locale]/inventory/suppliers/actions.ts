'use server';

import {
  create_supplier_action,
  update_supplier_action,
  delete_supplier_action,
} from '@/server/domains/inventory/suppliers/actions';
import type {
  CreateSupplierDto,
  UpdateSupplierDto,
} from '@/server/domains/inventory/suppliers/types';

/**
 * Server actions de la ruta. Devuelven el resultado en lugar de lanzar,
 * para que el formulario pueda mostrar el motivo real del error (en
 * producción Next.js oculta el mensaje de las excepciones).
 */
type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

const fail = (error: string | undefined, fallback: string): ActionResult<never> => ({
  success: false,
  error: error ?? fallback,
});

export async function createSupplierServerAction(
  payload: CreateSupplierDto,
): Promise<ActionResult<{ id?: number }>> {
  const result = await create_supplier_action(payload);
  return result.success
    ? { success: true, data: result.data }
    : fail(result.error, 'No se pudo crear el registro');
}

export async function updateSupplierServerAction(payload: UpdateSupplierDto): Promise<ActionResult> {
  const result = await update_supplier_action(payload);
  return result.success ? { success: true } : fail(result.error, 'No se pudo actualizar el registro');
}

export async function deleteSupplierServerAction(id: number): Promise<ActionResult> {
  const result = await delete_supplier_action({ id });
  return result.success ? { success: true } : fail(result.error, 'No se pudo eliminar el registro');
}
