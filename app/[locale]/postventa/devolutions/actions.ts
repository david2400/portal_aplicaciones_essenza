'use server';

import { parse_grid_query } from '@/server/lib/pagination';
import type { BulkResult } from '@/shared/models/pagination';
import { DEVOLUTION_GRID } from './grid';
import {
  get_returnable_action,
  request_return_action,
  return_flow_action,
  update_order_devolution_action,
  delete_order_devolution_action,
  bulk_delete_order_devolutions_action,
  export_order_devolutions_action,
} from '@/server/domains/devolution/order-devolutions/actions';
import type {
  ApproveReturnDto,
  InspectReturnDto,
  OrderDevolutionDto,
  ReceiveReturnDto,
  RefundReturnDto,
  RejectReturnDto,
  ReturnRequestDto,
  ReturnableOrderDto,
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

/** Solicitud de devolución con sus líneas. */
export async function requestReturnServerAction(
  payload: ReturnRequestDto,
): Promise<ActionResult<{ id?: number }>> {
  const result = await request_return_action(payload);
  return result.success
    ? { success: true, data: result.data }
    : fail(result.error, 'No se pudo registrar la devolución');
}

/** Lo que se puede devolver de una orden (excluyendo una devolución al editar sus líneas). */
export async function getReturnableServerAction(
  orderId: number,
  excludeDevolutionId?: number,
): Promise<ActionResult<ReturnableOrderDto>> {
  const result = await get_returnable_action(orderId, excludeDevolutionId);
  return result.success ? { success: true, data: result.data } : fail(result.error, 'No se encontró la orden');
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

// ─── Flujo ───────────────────────────────────────────────────────────────────

const flowFallback = 'No se pudo completar la acción';

export async function approveReturnServerAction(id: number, body: ApproveReturnDto): Promise<ActionResult<OrderDevolutionDto>> {
  const result = await return_flow_action(id, 'approve', body);
  return result.success ? { success: true, data: result.data } : fail(result.error, flowFallback);
}

export async function rejectReturnServerAction(id: number, body: RejectReturnDto): Promise<ActionResult<OrderDevolutionDto>> {
  const result = await return_flow_action(id, 'reject', body);
  return result.success ? { success: true, data: result.data } : fail(result.error, flowFallback);
}

export async function receiveReturnServerAction(id: number, body: ReceiveReturnDto): Promise<ActionResult<OrderDevolutionDto>> {
  const result = await return_flow_action(id, 'receive', body);
  return result.success ? { success: true, data: result.data } : fail(result.error, flowFallback);
}

export async function inspectReturnServerAction(id: number, body: InspectReturnDto): Promise<ActionResult<OrderDevolutionDto>> {
  const result = await return_flow_action(id, 'inspect', body);
  return result.success ? { success: true, data: result.data } : fail(result.error, flowFallback);
}

export async function refundReturnServerAction(id: number, body: RefundReturnDto): Promise<ActionResult<OrderDevolutionDto>> {
  const result = await return_flow_action(id, 'refund', body);
  return result.success ? { success: true, data: result.data } : fail(result.error, flowFallback);
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

// ─── Lote y exportación ──────────────────────────────────────────────────────

export async function bulkDeleteDevolutionsServerAction(ids: number[]): Promise<ActionResult<BulkResult>> {
  const result = await bulk_delete_order_devolutions_action(ids);
  return result.success ? { success: true, data: result.data } : fail(result.error, 'No se pudieron eliminar las devoluciones');
}

/** Exporta todas las devoluciones que cumplen la búsqueda actual. */
export async function exportDevolutionsServerAction(
  params: Record<string, string>,
): Promise<ActionResult<{ items: OrderDevolutionDto[]; truncated: boolean }>> {
  const result = await export_order_devolutions_action(parse_grid_query(params, DEVOLUTION_GRID));
  return result.success ? { success: true, data: result.data } : fail(result.error, 'No se pudo exportar');
}
