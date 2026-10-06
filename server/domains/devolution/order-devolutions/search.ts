import 'server-only';

import { cache } from 'react';

import { order_devolutions_repository } from './repository';
import type { OrderDevolutionDto } from './types';
import { order_devolutions_tags } from '@/server/lib/cache-tags';
import { create_search_resource } from '@/server/lib/search-resource';
import type { GridQuery } from '@/shared/models/pagination';

/** Paginación, búsqueda, exportación y borrado en lote (con respaldo si el backend no los tiene). */
export const order_devolutions_resource = create_search_resource<OrderDevolutionDto>({
  base_path: '/api/shop/devolution/order_devolutions',
  list_tag: order_devolutions_tags.list(),
  list_all: () => order_devolutions_repository.list_order_devolutions(),
  delete_one: (id) => order_devolutions_repository.delete_order_devolution({ id }),
  search_fields: (item) => [item.id, item.order_id, item.external_reference, item.observation],
  filter_fields: {
    state: (item) => item.state,
    motiveDevolutionId: (item) => item.motive_devolution_id,
    orderId: (item) => item.order_id,
  },
});

export const search_order_devolutions = cache(async (query: GridQuery) => order_devolutions_resource.search(query));
