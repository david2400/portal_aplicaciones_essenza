import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { suppliers_tags } from '@/server/lib/cache-tags';
import type {
  SupplierDto,
  CreateSupplierDto,
  UpdateSupplierPayload,
  DeleteSupplierPayload,
} from './types';

const suppliers_base_path = '/api/shop/inventory/suppliers';
const supplier_by_id_path = (id: number) => `${suppliers_base_path}/${id}`;

export const suppliers_repository = {
  async list_suppliers(): Promise<SupplierDto[]> {
    return server_fetch.get<SupplierDto[]>(suppliers_base_path, {
      revalidate: 60,
      tags: [suppliers_tags.list()],
    });
  },

  async get_supplier_by_id(id: number): Promise<SupplierDto> {
    return server_fetch.get<SupplierDto>(supplier_by_id_path(id), {
      revalidate: 60,
      tags: [suppliers_tags.item(id)],
    });
  },

  async create_supplier(payload: CreateSupplierDto): Promise<SupplierDto> {
    return server_fetch.post<SupplierDto>(suppliers_base_path, payload, {
      revalidate: false,
    });
  },

  async update_supplier(payload: UpdateSupplierPayload): Promise<SupplierDto> {
    const { id, ...body } = payload;
    return server_fetch.put<SupplierDto>(supplier_by_id_path(id), body, {
      revalidate: false,
    });
  },

  async delete_supplier(payload: DeleteSupplierPayload): Promise<void> {
    return server_fetch.delete<void>(supplier_by_id_path(payload.id), {
      revalidate: false,
    });
  },
} as const;
