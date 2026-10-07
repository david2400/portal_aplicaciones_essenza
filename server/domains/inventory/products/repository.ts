import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { to_list } from '@/server/lib/list-response';
import { products_tags, stock_tags } from '@/server/lib/cache-tags';
import type {
  ProductDto,
  CreateProductDto,
  UpdateProductPayload,
  DeleteProductPayload,
  ListProductsParams,
  ProductSearchParams,
  ProductSkuDto,
  ProductImageDto,
  ProductStatsDto,
  ProductStatsParams,
  ReplaceProductImagesPayload,
} from './types';

const products_base_path = '/api/shop/catalog/products';
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
      tags: [products_tags.item(id), stock_tags.all()],
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

  /** Indicadores agregados del catálogo (sin cargar productos). */
  async get_product_stats(params: ProductStatsParams = {}): Promise<ProductStatsDto> {
    return server_fetch.get<ProductStatsDto>(`${products_base_path}/stats`, {
      params,
      revalidate: 60,
      tags: [products_tags.list(), stock_tags.all()],
    });
  },

  async list_product_skus(id: number): Promise<ProductSkuDto[]> {
    return server_fetch.get<ProductSkuDto[]>(`${product_by_id_path(id)}/skus`, {
      revalidate: 30,
      tags: [products_tags.item(id), stock_tags.all()],
    });
  },

  async list_product_images(id: number): Promise<ProductImageDto[]> {
    return server_fetch.get<ProductImageDto[]>(`${product_by_id_path(id)}/images`, {
      revalidate: 30,
      tags: [products_tags.item(id)],
    });
  },

  async replace_product_images(payload: ReplaceProductImagesPayload): Promise<ProductImageDto[]> {
    const { id, ...body } = payload;
    return server_fetch.put<ProductImageDto[]>(`${product_by_id_path(id)}/images`, body, {
      revalidate: false,
    });
  },

  async delete_product(payload: DeleteProductPayload): Promise<void> {
    return server_fetch.delete<void>(product_by_id_path(payload.id), {
      revalidate: false,
    });
  },
} as const;
