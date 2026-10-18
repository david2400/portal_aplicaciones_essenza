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
  search_fields: (item) => [item.id, item.order_number, item.customer_name, item.customer_doc_number, item.complementary_order],
  filter_fields: {
    state: (item) => item.state,
    channel: (item) => item.channel,
    storeId: (item) => item.store_id,
    priority: (item) => item.priority,
    deliveryMethod: (item) => item.delivery_method,
  },
});

export const search_orders = cache(async (query: GridQuery) => orders_resource.search(query));
