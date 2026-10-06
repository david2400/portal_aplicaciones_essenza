import 'server-only';

import { cache } from 'react';

import { product_templates_repository } from './repository';

export const list_product_templates = cache(async () => {
  return product_templates_repository.list_product_templates();
});

export const get_product_template_by_id = cache(async ({ id }: { id: number }) => {
  return product_templates_repository.get_product_template_by_id(id);
});
