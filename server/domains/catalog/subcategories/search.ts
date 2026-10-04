import 'server-only';

import { cache } from 'react';

import { subcategories_repository } from './repository';
import type { SubcategoryDto } from './types';
import { subcategories_tags } from '@/server/lib/cache-tags';
import { create_search_resource } from '@/server/lib/search-resource';
import type { GridQuery } from '@/shared/models/pagination';

/** Paginación, búsqueda, exportación y borrado en lote de subcategories. */
export const subcategories_resource = create_search_resource<SubcategoryDto>({
  base_path: '/api/shop/catalog/subcategories',
  list_tag: subcategories_tags.list(),
  list_all: () => subcategories_repository.list_subcategories(),
  delete_one: (id) => subcategories_repository.delete_subcategory({ id }),
  search_fields: (item) => [item.name, item.slug, item.description],
  filter_fields: { categoryId: (item) => item.categoryId },
});

export const search_subcategories = cache(async (query: GridQuery) => subcategories_resource.search(query));
