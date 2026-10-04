import 'server-only';

import { cache } from 'react';

import { type_products_repository } from './repository';

export const list_type_products = cache(async () => {
  return type_products_repository.list_type_products();
});

export const get_type_product_by_id = cache(async ({ id }: { id: number }) => {
  return type_products_repository.get_type_product_by_id(id);
});
