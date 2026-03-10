import 'server-only';

import { cache } from 'react';

import { type_product_features_repository } from './repository';

export const list_type_product_features = cache(async () => {
  return type_product_features_repository.list_type_product_features();
});

export const get_type_product_feature_by_type_product = cache(async ({
  type_product_id,
}: {
  type_product_id: number;
}) => {
  return type_product_features_repository.get_type_product_feature_by_type_product(
    type_product_id,
  );
});
