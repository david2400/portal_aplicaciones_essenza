import 'server-only';

import { cache } from 'react';

import { warehouses_repository } from './repository';
import type { ListWarehousesParams, WarehouseStockQuery } from './types';

export const list_warehouses = cache(async (params?: ListWarehousesParams) => {
  return warehouses_repository.list_warehouses(params);
});

/** Lista plana de bodegas (selects de tiendas, cajas, movimientos, productos…). */
export const list_all_warehouses = cache(async () => warehouses_repository.list_all());

export const get_warehouse_stats = cache(async () => warehouses_repository.get_stats());

export const get_warehouse = cache(async ({ id }: { id: number }) => warehouses_repository.get_warehouse(id));

export const get_warehouse_stock = cache(async (id: number, query: WarehouseStockQuery) =>
  warehouses_repository.stock(id, query),
);

export const get_warehouse_movements = cache(async (id: number) => warehouses_repository.movements(id, 15));

export const get_warehouse_links = cache(async (id: number) => warehouses_repository.links(id));

export const list_warehouse_locations = cache(async (id: number) => warehouses_repository.locations(id));
