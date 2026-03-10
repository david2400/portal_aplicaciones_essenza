import 'server-only';

import { cache } from 'react';

import { product_combos_repository } from './repository';

export const list_product_combos = cache(async () => {
  return product_combos_repository.list_product_combos();
});

export const get_product_combo_by_id = cache(async ({ id }: { id: number }) => {
  return product_combos_repository.get_product_combo_by_id(id);
});
