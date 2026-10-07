import 'server-only';

import { cache } from 'react';

import { product_children_repository } from './repository';

export const list_product_children = cache(async () => {
  return product_children_repository.list_product_children();
});

export const get_product_child_by_id = cache(async ({ id }: { id: number }) => {
  return product_children_repository.get_product_child_by_id(id);
});

export const list_variants_of_product = cache(async ({ product_id }: { product_id: number }) => {
  return product_children_repository.list_variants_of_product(product_id);
});
