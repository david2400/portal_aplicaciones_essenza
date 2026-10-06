import 'server-only';

import { cache } from 'react';

import { product_attributes_repository } from './repository';

export const get_product_attributes = cache(async ({ product_id }: { product_id: number }) => {
  return product_attributes_repository.get_product_attributes(product_id);
});
