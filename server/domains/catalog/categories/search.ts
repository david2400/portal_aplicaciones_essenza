import 'server-only';

import { cache } from 'react';

import { categories_repository } from './repository';
import type { CategoryDto } from './types';
import { categories_tags } from '@/server/lib/cache-tags';
import { create_search_resource } from '@/server/lib/search-resource';
import type { GridQuery } from '@/shared/models/pagination';

/** Paginación, búsqueda, exportación y borrado en lote de categories. */
export const categories_resource = create_search_resource<CategoryDto>({
  base_path: '/api/shop/catalog/categories',
  list_tag: categories_tags.list(),
  list_all: () => categories_repository.list_categories(),
  delete_one: (id) => categories_repository.delete_category({ id }),
  search_fields: (item) => [item.name, item.slug, item.description],
});

export const search_categories = cache(async (query: GridQuery) => categories_resource.search(query));
