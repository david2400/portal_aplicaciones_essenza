import 'server-only';

import { cache } from 'react';

import { product_features_repository } from './repository';
import type { GetProductFeatureParams } from './types';

export const list_product_features = cache(async () => {
  return product_features_repository.list_product_features();
});

export const get_product_feature = cache(async (params: GetProductFeatureParams) => {
  return product_features_repository.get_product_feature(params);
});
