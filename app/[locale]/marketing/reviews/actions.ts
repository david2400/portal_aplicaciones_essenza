'use server';

import {
  moderate_product_review_action,
  delete_product_review_action,
} from '@/server/domains/reviews/product-reviews/actions';

type ActionResult = { success: true } | { success: false; error: string };

export type ModerationDecision = 'APPROVED' | 'REJECTED' | 'PENDING';

export async function moderateReviewServerAction(
  id: number,
  decision: ModerationDecision,
  notes?: string,
): Promise<ActionResult> {
  const result = await moderate_product_review_action({
    id,
    moderationStatus: decision,
    isApproved: decision === 'APPROVED',
    moderationNotes: notes || undefined,
  });
  return result.success ? { success: true } : { success: false, error: result.error ?? 'No se pudo moderar la reseña' };
}

export async function deleteReviewServerAction(id: number): Promise<ActionResult> {
  const result = await delete_product_review_action(id);
  return result.success ? { success: true } : { success: false, error: result.error ?? 'No se pudo eliminar la reseña' };
}
