import 'server-only';

import { cache } from 'react';

import { products_repository } from './repository';
import type { ListProductsParams, ProductSearchParams, ProductStatsParams } from './types';

export const list_products = cache(async (params?: ListProductsParams) => {
  return products_repository.list_products(params);
});

export const get_product_by_id = cache(async ({ id }: { id: number }) => {
  return products_repository.get_product_by_id(id);
});

export const get_product_stats = cache(async (params: ProductStatsParams = {}) => {
  return products_repository.get_product_stats(params);
});

export const list_product_skus = cache(async ({ id }: { id: number }) => {
  return products_repository.list_product_skus(id);
});

export const list_product_images = cache(async ({ id }: { id: number }) => {
  return products_repository.list_product_images(id);
});

export const search_products = cache(async (params: ProductSearchParams) => {
  return products_repository.search_products(params);
});
