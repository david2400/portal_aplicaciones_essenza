import 'server-only';

import { cache } from 'react';

import { dispatch_products_repository } from './repository';
import type { DispatchProductDto } from './types';
import { dispatch_products_tags } from '@/server/lib/cache-tags';
import { create_search_resource } from '@/server/lib/search-resource';
import type { GridQuery } from '@/shared/models/pagination';

/** Paginación, búsqueda, exportación y borrado en lote (con respaldo si el backend no los tiene). */
export const dispatch_products_resource = create_search_resource<DispatchProductDto>({
  base_path: '/api/shop/dispatch/dispatch_products',
  list_tag: dispatch_products_tags.list(),
  list_all: () => dispatch_products_repository.list_dispatch_products(),
  delete_one: (id) => dispatch_products_repository.delete_dispatch_product({ id }),
  search_fields: (item) => [item.id, item.orderId, item.guideNumber, item.address, item.cityOrigin, item.cityDestination],
  filter_fields: {
    orderId: (item) => item.orderId,
    cityDestination: (item) => item.cityDestination,
  },
});

export const search_dispatch_products = cache(async (query: GridQuery) => dispatch_products_resource.search(query));
