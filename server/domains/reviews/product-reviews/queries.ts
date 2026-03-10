import 'server-only';

import { cache } from 'react';

import { product_reviews_repository } from './repository';
import type { ProductReviewFilters, ProductReviewPageParams } from './repository';

export const list_product_reviews = cache(async (filters?: ProductReviewFilters) => {
  return product_reviews_repository.list_reviews(filters);
});

export const list_product_reviews_paginated = cache(
  async (params?: ProductReviewPageParams) => {
    return product_reviews_repository.list_reviews_paginated(params);
  },
);

export const get_product_review_by_id = cache(async ({ id }: { id: number }) => {
  return product_reviews_repository.get_review_by_id(id);
});
