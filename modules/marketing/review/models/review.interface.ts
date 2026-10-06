/** @format */

import type { ProductReviewDto } from "@/server/domains/reviews/product-reviews/types";

export type IReview = ProductReviewDto;

export const MODERATION_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type ModerationStatus = (typeof MODERATION_STATUSES)[number];

/** Estado efectivo: si el backend no envía `moderationStatus`, se deduce de `isApproved`. */
export const reviewStatus = (review: IReview): ModerationStatus => {
  const status = review.moderation_status?.toUpperCase();
  if (status === "APPROVED" || status === "REJECTED" || status === "PENDING") return status;
  return review.is_approved ? "APPROVED" : "PENDING";
};
