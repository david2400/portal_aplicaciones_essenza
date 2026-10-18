import 'server-only';

import { cache } from 'react';

import { warehouses_repository } from './repository';
import type { WarehouseDto } from './types';
import { warehouses_tags } from '@/server/lib/cache-tags';
import { create_search_resource } from '@/server/lib/search-resource';
import type { GridQuery } from '@/shared/models/pagination';

/** Paginación, búsqueda (nombre, código, ciudad, dirección, responsable), exportación y lote. */
export const warehouses_resource = create_search_resource<WarehouseDto>({
  base_path: '/api/shop/inventory/warehouses',
  list_tag: warehouses_tags.list(),
  list_all: () => warehouses_repository.list_all(),
  delete_one: (id) => warehouses_repository.delete_warehouse(id),
  search_fields: (item) => [item.name, item.code, item.city, item.address, item.manager_name],
  filter_fields: {
    warehouseType: (item) => item.warehouse_type,
    active: (item) => String(item.active !== false),
    cityId: (item) => item.city_id,
  },
});

export const search_warehouses = cache(async (query: GridQuery) => warehouses_resource.search(query));
