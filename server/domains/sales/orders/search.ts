import 'server-only';

import { cache } from 'react';

import { orders_repository } from './repository';
import type { OrderDto } from './types';
import { orders_tags } from '@/server/lib/cache-tags';
import { create_search_resource } from '@/server/lib/search-resource';
import type { GridQuery } from '@/shared/models/pagination';

/** Paginación, búsqueda, exportación y borrado en lote (con respaldo si el backend no los tiene). */
export const orders_resource = create_search_resource<OrderDto>({
  base_path: '/api/shop/sales/orders',
  list_tag: orders_tags.list(),
  list_all: () => orders_repository.list_orders(),
  delete_one: (id) => orders_repository.delete_order({ id }),
  search_fields: (item) => [item.id, item.complementaryOrder],
  filter_fields: {
    state: (item) => item.state,
  },
});

export const search_orders = cache(async (query: GridQuery) => orders_resource.search(query));
