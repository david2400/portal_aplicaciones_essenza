import 'server-only';

import { cache } from 'react';

import { categories_repository } from './repository';

export const get_category_by_id = cache(async ({ id }: { id: number }) => {
  return categories_repository.get_category_by_id(id);
});
