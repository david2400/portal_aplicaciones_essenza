import 'server-only';

import { cache } from 'react';

import { brands_repository } from './repository';
import type { BrandDto } from './types';
import { brands_tags } from '@/server/lib/cache-tags';
import { create_search_resource } from '@/server/lib/search-resource';
import type { GridQuery } from '@/shared/models/pagination';

/** Paginación, búsqueda, exportación y borrado en lote de brands. */
export const brands_resource = create_search_resource<BrandDto>({
  base_path: '/api/shop/catalog/brands',
  list_tag: brands_tags.list(),
  list_all: () => brands_repository.list_brands(),
  delete_one: (id) => brands_repository.delete_brand({ id }),
  search_fields: (item) => [item.name, item.slug, item.description],
});

export const search_brands = cache(async (query: GridQuery) => brands_resource.search(query));
