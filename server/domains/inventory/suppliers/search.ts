import 'server-only';

import { cache } from 'react';

import { suppliers_repository } from './repository';
import type { SupplierDto } from './types';
import { suppliers_tags } from '@/server/lib/cache-tags';
import { create_search_resource } from '@/server/lib/search-resource';
import type { GridQuery } from '@/shared/models/pagination';

/** Paginación, búsqueda (razón social, nombre comercial, código, NIT, correo, ciudad), exportación y lote. */
export const suppliers_resource = create_search_resource<SupplierDto>({
  base_path: '/api/shop/inventory/suppliers',
  list_tag: suppliers_tags.list(),
  list_all: () => suppliers_repository.list_suppliers(),
  delete_one: (id) => suppliers_repository.delete_supplier({ id }),
  search_fields: (item) => [item.name, item.trade_name, item.code, item.doc_number, item.email, item.city],
  filter_fields: {
    status: (item) => item.status,
    cityId: (item) => item.city_id,
  },
});

export const search_suppliers = cache(async (query: GridQuery) => suppliers_resource.search(query));
