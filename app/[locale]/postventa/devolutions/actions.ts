'use server';

import {
  create_order_devolution_action,
  update_order_devolution_action,
  delete_order_devolution_action,
} from '@/server/domains/devolution/order-devolutions/actions';
import { get_order_devolution_by_id } from '@/server/domains/devolution/order-devolutions/queries';
import type {
  CreateOrderDevolutionDto,
  OrderDevolutionDto,
  UpdateOrderDevolutionPayload,
} from '@/server/domains/devolution/order-devolutions/types';
import {
  create_order_devolution_detail_action,
  update_order_devolution_detail_action,
  delete_order_devolution_detail_action,
} from '@/server/domains/devolution/order-devolution-details/actions';
import type {
  CreateOrderDevolutionDetailDto,
  UpdateOrderDevolutionDetailPayload,
} from '@/server/domains/devolution/order-devolution-details/types';
import {
  create_order_devolution_evidence_action,
  delete_order_devolution_evidence_action,
} from '@/server/domains/devolution/order-devolution-evidences/actions';
import type { CreateOrderDevolutionEvidenceDto } from '@/server/domains/devolution/order-devolution-evidences/types';
import { ServerApiError } from '@/server/lib/types';

/**
 * Server actions de la ruta. Devuelven el resultado en lugar de lanzar,
 * para que la UI pueda mostrar el motivo real del error (en producción
 * Next.js oculta el mensaje de las excepciones).
 */
type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

const fail = (error: string | undefined, fallback: string): ActionResult<never> => ({
  success: false,
  error: error ?? fallback,
});

// ─── Devolución ───────────────────────────────────────────────────────────────

export async function createDevolutionServerAction(
  payload: CreateOrderDevolutionDto,
): Promise<ActionResult<{ id?: number }>> {
  const result = await create_order_devolution_action({ state: 'P', ...payload });
  return result.success
    ? { success: true, data: result.data }
    : fail(result.error, 'No se pudo registrar la devolución');
}

export async function updateDevolutionServerAction(
  payload: UpdateOrderDevolutionPayload,
): Promise<ActionResult> {
  const result = await update_order_devolution_action(payload);
  return result.success ? { success: true } : fail(result.error, 'No se pudo actualizar la devolución');
}

export async function deleteDevolutionServerAction(id: number): Promise<ActionResult> {
  const result = await delete_order_devolution_action({ id });
  return result.success ? { success: true } : fail(result.error, 'No se pudo eliminar la devolución');
}

/** Campos que puede modificar un cambio de estado. */
export type DevolutionTransitionPatch = Pick<
  OrderDevolutionDto,
  | 'state'
  | 'approvedBy'
  | 'approvedAt'
  | 'receivedBy'
  | 'receivedAt'
  | 'inspectionNotes'
  | 'totalRefundAmount'
>;

/**
 * Cambia el estado de una devolución. El PUT del backend valida el payload
 * completo (`UpdateOrderDevolutionDto extends CreateOrderDevolutionDto`), así
 * que se parte del registro actual en el servidor y se aplica el parche.
 */
export async function transitionDevolutionServerAction(
  id: number,
  patch: DevolutionTransitionPatch,
): Promise<ActionResult> {
  let current: OrderDevolutionDto;
  try {
    current = await get_order_devolution_by_id({ id });
  } catch (error) {
    return fail(error instanceof ServerApiError ? error.message : undefined, 'No se encontró la devolución');
  }

  const result = await update_order_devolution_action({
    id,
    observation: current.observation ?? '',
    state: current.state,
    motiveDevolutionId: current.motiveDevolutionId ?? 0,
    orderId: current.orderId ?? 0,
    returnMethodId: current.returnMethodId,
    refundMethodId: current.refundMethodId,
    totalRefundAmount: current.totalRefundAmount,
    approvedBy: current.approvedBy,
    approvedAt: current.approvedAt,
    receivedBy: current.receivedBy,
    receivedAt: current.receivedAt,
    inspectionNotes: current.inspectionNotes,
    externalReference: current.externalReference,
    ...patch,
  } as UpdateOrderDevolutionPayload);

  return result.success ? { success: true } : fail(result.error, 'No se pudo cambiar el estado');
}

// ─── Líneas devueltas ────────────────────────────────────────────────────────

export async function createDevolutionDetailServerAction(
  payload: CreateOrderDevolutionDetailDto,
): Promise<ActionResult<{ id?: number }>> {
  const result = await create_order_devolution_detail_action(payload);
  return result.success
    ? { success: true, data: result.data }
    : fail(result.error, 'No se pudo agregar el producto');
}

export async function updateDevolutionDetailServerAction(
  payload: UpdateOrderDevolutionDetailPayload,
): Promise<ActionResult> {
  const result = await update_order_devolution_detail_action(payload);
  return result.success ? { success: true } : fail(result.error, 'No se pudo actualizar el producto');
}

export async function deleteDevolutionDetailServerAction(id: number): Promise<ActionResult> {
  const result = await delete_order_devolution_detail_action({ id });
  return result.success ? { success: true } : fail(result.error, 'No se pudo eliminar el producto');
}

// ─── Evidencias ──────────────────────────────────────────────────────────────

export async function createDevolutionEvidenceServerAction(
  payload: CreateOrderDevolutionEvidenceDto,
): Promise<ActionResult<{ id?: number }>> {
  const result = await create_order_devolution_evidence_action(payload);
  return result.success
    ? { success: true, data: result.data }
    : fail(result.error, 'No se pudo registrar la evidencia');
}

export async function deleteDevolutionEvidenceServerAction(id: number): Promise<ActionResult> {
  const result = await delete_order_devolution_evidence_action({ id });
  return result.success ? { success: true } : fail(result.error, 'No se pudo eliminar la evidencia');
}
