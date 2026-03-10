import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { inventory_movements_tags } from '@/server/lib/cache-tags';
import type { InventoryMovementDto } from './types';

const inventory_movements_transfer_path = '/api/shop/inventory/inventory_movements/transfer';
const inventory_movements_exit_path = '/api/shop/inventory/inventory_movements/exit';
const inventory_movements_entry_path = '/api/shop/inventory/inventory_movements/entry';

export const inventory_movements_repository = {
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
