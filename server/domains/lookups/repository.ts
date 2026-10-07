import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import type {
  LookupOptionDto,
  LookupParams,
  ProductLookupDto,
  ProductLookupParams,
  SkuLookupDto,
  SkuLookupParams,
  SubcategoryLookupParams,
} from './types';

/** El backend acepta hasta 50 ids por consulta. */
const MAX_IDS = 50;

const to_query = ({ ids, ...rest }: LookupParams & Record<string, unknown>) => ({
  ...rest,
  ids: ids && ids.length > 0 ? ids.join(',') : undefined,
});

/** Búsqueda ligera; sin caché de datos (resultados según lo que se escribe). */
async function lookup<T>(path: string, params: LookupParams & Record<string, unknown>): Promise<T[]> {
  const ids = [...new Set((params.ids ?? []).filter((id) => Number.isInteger(id) && id > 0))];
  if (ids.length > MAX_IDS) {
    const chunks: number[][] = [];
    for (let i = 0; i < ids.length; i += MAX_IDS) chunks.push(ids.slice(i, i + MAX_IDS));
    const pages = await Promise.all(chunks.map((chunk) => lookup<T>(path, { ...params, ids: chunk })));
    return pages.flat();
  }
  return server_fetch.get<T[]>(path, { params: to_query({ ...params, ids }), revalidate: 0 });
}

export const lookups_repository = {
  skus: ({ sellable_only, ...params }: SkuLookupParams) =>
    lookup<SkuLookupDto>('/api/shop/catalog/skus/lookup', { ...params, sellable_only: sellable_only || undefined }),

  products: ({ statuses, ...params }: ProductLookupParams) =>
    lookup<ProductLookupDto>('/api/shop/catalog/products/lookup', {
      ...params,
      statuses: statuses && statuses.length > 0 ? statuses.join(',') : undefined,
    }),

  brands: (params: LookupParams) => lookup<LookupOptionDto>('/api/shop/catalog/brands/lookup', params),

  categories: (params: LookupParams) => lookup<LookupOptionDto>('/api/shop/catalog/categories/lookup', params),

  subcategories: (params: SubcategoryLookupParams) =>
    lookup<LookupOptionDto>('/api/shop/catalog/subcategories/lookup', params),

  suppliers: (params: LookupParams) => lookup<LookupOptionDto>('/api/shop/inventory/suppliers/lookup', params),
} as const;
