import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { to_list } from '@/server/lib/list-response';
import { inventory_movements_tags } from '@/server/lib/cache-tags';
import type { InventoryMovementDto } from './types';

const inventory_movements_transfer_path = '/api/shop/inventory/inventory_movements/transfer';
const inventory_movements_exit_path = '/api/shop/inventory/inventory_movements/exit';
const inventory_movements_entry_path = '/api/shop/inventory/inventory_movements/entry';
const inventory_movements_base_path = '/api/shop/inventory/inventory_movements';

export const inventory_movements_repository = {
  async list_inventory_movements(params?: { page?: number; size?: number }): Promise<InventoryMovementDto[]> {
    const query = new URLSearchParams();
    query.set('page', String(params?.page ?? 0));
    query.set('size', String(params?.size ?? 200));
    const response = await server_fetch.get<unknown>(`${inventory_movements_base_path}?${query.toString()}`, {
      revalidate: 30,
      tags: [inventory_movements_tags.list()],
    });
    return to_list<InventoryMovementDto>(response);
  },

  async transfer_inventory(payload: InventoryMovementDto): Promise<InventoryMovementDto> {
    return server_fetch.post<InventoryMovementDto>(inventory_movements_transfer_path, payload, {
      revalidate: false,
      tags: [inventory_movements_tags.transfers()],
    });
  },

  async exit_inventory(payload: InventoryMovementDto): Promise<InventoryMovementDto> {
    return server_fetch.post<InventoryMovementDto>(inventory_movements_exit_path, payload, {
      revalidate: false,
      tags: [inventory_movements_tags.exits()],
    });
  },

  async entry_inventory(payload: InventoryMovementDto): Promise<InventoryMovementDto> {
    return server_fetch.post<InventoryMovementDto>(inventory_movements_entry_path, payload, {
      revalidate: false,
      tags: [inventory_movements_tags.entries()],
    });
  },
} as const;
