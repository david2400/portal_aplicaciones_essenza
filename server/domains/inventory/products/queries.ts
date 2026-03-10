import 'server-only';

import { cache } from 'react';

import { products_repository } from './repository';
import type { ListProductsParams, ProductSearchParams } from './types';

export const list_products = cache(async (params?: ListProductsParams) => {
  return products_repository.list_products(params);
});

export const get_product_by_id = cache(async ({ id }: { id: number }) => {
  return products_repository.get_product_by_id(id);
});

export const search_products = cache(async (params: ProductSearchParams) => {
  return products_repository.search_products(params);
});
