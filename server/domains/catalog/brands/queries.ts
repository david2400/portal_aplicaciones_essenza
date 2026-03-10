import 'server-only';

import { cache } from 'react';

import { brands_repository } from './repository';

export const get_brand_by_id = cache(async ({ id }: { id: number }) => {
  return brands_repository.get_brand_by_id(id);
});
