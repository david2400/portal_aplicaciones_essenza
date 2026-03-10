import 'server-only';

import { cache } from 'react';

import { features_repository } from './repository';

export const list_features = cache(async () => {
  return features_repository.list_features();
});

export const get_feature_by_id = cache(async ({ id }: { id: number }) => {
  return features_repository.get_feature_by_id(id);
});
