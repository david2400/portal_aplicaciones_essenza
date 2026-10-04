import 'server-only';

import { cache } from 'react';

import { subcategories_repository } from './repository';

export const get_subcategory_by_id = cache(async ({ id }: { id: number }) => {
  return subcategories_repository.get_subcategory_by_id(id);
});

export const list_subcategories = cache(async () => {
  return subcategories_repository.list_subcategories();
});
