import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { to_list } from '@/server/lib/list-response';
import { products_tags } from '@/server/lib/cache-tags';
import type {
  ProductDto,
  CreateProductDto,
  UpdateProductPayload,
  DeleteProductPayload,
  ListProductsParams,
  ProductSearchParams,
} from './types';

const products_base_path = '/api/shop/inventory/products';
const product_by_id_path = (id: number) => `${products_base_path}/${id}`;
const product_search_path = `${products_base_path}/search`;

function build_pagination_query(params?: ListProductsParams): string {
  if (!params) {
    return '';
  }

  const query = new URLSearchParams();

  if (params.page !== undefined) {
    query.set('page', String(params.page));
  }
  if (params.size !== undefined) {
    query.set('size', String(params.size));
  }
  if (params.sort) {
    query.set('sort', params.sort);
  }

  const query_string = query.toString();
  return query_string ? `?${query_string}` : '';
}

export const products_repository = {
  async list_products(params?: ListProductsParams): Promise<ProductDto[]> {
    const query = build_pagination_query(params);
    const response = await server_fetch.get<unknown>(`${products_base_path}${query}`, {
      revalidate: 60,
      tags: [products_tags.list()],
    });
    return to_list<ProductDto>(response);
  },

  async search_products(payload: ProductSearchParams): Promise<ProductDto[]> {
    const { filter, ...rest } = payload;
    const query = build_pagination_query(rest);
    return server_fetch.post<ProductDto[]>(`${product_search_path}${query}`, filter, {
      revalidate: 30,
    });
  },

  async get_product_by_id(id: number): Promise<ProductDto> {
    return server_fetch.get<ProductDto>(product_by_id_path(id), {
      revalidate: 60,
      tags: [products_tags.item(id)],
    });
  },

  async create_product(payload: CreateProductDto): Promise<ProductDto> {
    return server_fetch.post<ProductDto>(products_base_path, payload, {
      revalidate: false,
    });
  },

  async update_product(payload: UpdateProductPayload): Promise<ProductDto> {
    const { id, ...body } = payload;
    return server_fetch.put<ProductDto>(product_by_id_path(id), body, {
      revalidate: false,
    });
  },

  async delete_product(payload: DeleteProductPayload): Promise<void> {
    return server_fetch.delete<void>(product_by_id_path(payload.id), {
      revalidate: false,
    });
  },
} as const;
