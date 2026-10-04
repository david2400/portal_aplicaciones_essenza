import 'server-only';

import { cache } from 'react';

import { product_recommendations_repository } from './repository';

export const list_product_recommendations = cache(async () => {
  return product_recommendations_repository.list_product_recommendations();
});

export const get_product_recommendation_by_id = cache(async ({ id }: { id: number }) => {
  return product_recommendations_repository.get_product_recommendation_by_id(id);
});
