import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type ProductReviewDto = components['schemas']['ProductReviewDto'];
export type CreateProductReviewDto = components['schemas']['CreateProductReviewDto'];
export type UpdateProductReviewDto = components['schemas']['UpdateProductReviewDto'];
export type VoteProductReviewHelpfulDto = components['schemas']['VoteProductReviewHelpfulDto'];
export type ModerateProductReviewDto = components['schemas']['ModerateProductReviewDto'];

export type UpdateProductReviewPayload = UpdateProductReviewDto & { id: number };
export type VoteReviewPayload = VoteProductReviewHelpfulDto & { id: number };
export type ModerateReviewPayload = ModerateProductReviewDto & { id: number };
