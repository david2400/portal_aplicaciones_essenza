import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { to_list } from '@/server/lib/list-response';
import { suppliers_tags } from '@/server/lib/cache-tags';
import type {
  ChangeSupplierStatusDto,
  DeleteSupplierPayload,
  SaveSupplierDto,
  SaveSupplierProductDto,
  SupplierDto,
  SupplierProductDto,
  SupplierStatsDto,
  UpdateSupplierPayload,
} from './types';

const suppliers_base_path = '/api/shop/inventory/suppliers';
const supplier_by_id_path = (id: number) => `${suppliers_base_path}/${id}`;
const products_path = (id: number) => `${supplier_by_id_path(id)}/products`;

export const suppliers_repository = {
  async list_suppliers(): Promise<SupplierDto[]> {
    const response = await server_fetch.get<unknown>(suppliers_base_path, {
      revalidate: 60,
      tags: [suppliers_tags.list()],
    });
    return to_list<SupplierDto>(response);
  },

  async get_stats(): Promise<SupplierStatsDto> {
    return server_fetch.get<SupplierStatsDto>(`${suppliers_base_path}/stats`, {
      revalidate: 30,
      tags: [suppliers_tags.list()],
    });
  },

  async get_supplier_by_id(id: number): Promise<SupplierDto> {
    return server_fetch.get<SupplierDto>(supplier_by_id_path(id), {
      revalidate: 30,
      tags: [suppliers_tags.item(id)],
    });
  },

  async create_supplier(payload: SaveSupplierDto): Promise<SupplierDto> {
    return server_fetch.post<SupplierDto>(suppliers_base_path, payload, { revalidate: false });
  },

  async update_supplier(payload: UpdateSupplierPayload): Promise<SupplierDto> {
    const { id, ...body } = payload;
    return server_fetch.put<SupplierDto>(supplier_by_id_path(id), body, { revalidate: false });
  },

  async change_status(id: number, payload: ChangeSupplierStatusDto): Promise<SupplierDto> {
    return server_fetch.post<SupplierDto>(`${supplier_by_id_path(id)}/status`, payload, { revalidate: false });
  },

  async delete_supplier(payload: DeleteSupplierPayload): Promise<void> {
    return server_fetch.delete<void>(supplier_by_id_path(payload.id), { revalidate: false });
  },

  async list_products(id: number): Promise<SupplierProductDto[]> {
    const response = await server_fetch.get<unknown>(products_path(id), {
      revalidate: 30,
      tags: [suppliers_tags.item(id)],
    });
    return to_list<SupplierProductDto>(response);
  },

  async save_product(id: number, product_id: number | null, payload: SaveSupplierProductDto): Promise<SupplierProductDto> {
    return product_id == null
      ? server_fetch.post<SupplierProductDto>(products_path(id), payload, { revalidate: false })
      : server_fetch.put<SupplierProductDto>(`${products_path(id)}/${product_id}`, payload, { revalidate: false });
  },

  async delete_product(id: number, product_id: number): Promise<void> {
    return server_fetch.delete<void>(`${products_path(id)}/${product_id}`, { revalidate: false });
  },
} as const;
