import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { product_attributes_tags } from '@/server/lib/cache-tags';
import type {
  CreateAxisOptionDto,
  SaveVariantMatrixDto,
  SaveVariantMatrixResultDto,
  VariantMatrixDto,
  VariantMatrixOption,
} from './types';

const path = (product_id: number) => `/api/shop/catalog/products/${product_id}/variant-matrix`;

export const variant_matrix_repository = {
  async get(product_id: number): Promise<VariantMatrixDto> {
    return server_fetch.get<VariantMatrixDto>(path(product_id), {
      revalidate: 0,
      tags: [product_attributes_tags.item(product_id)],
    });
  },

  async save(product_id: number, payload: SaveVariantMatrixDto): Promise<SaveVariantMatrixResultDto> {
    return server_fetch.put<SaveVariantMatrixResultDto>(path(product_id), payload, { revalidate: false });
  },

  async create_option(product_id: number, payload: CreateAxisOptionDto): Promise<VariantMatrixOption> {
    return server_fetch.post<VariantMatrixOption>(`${path(product_id)}/options`, payload, { revalidate: false });
  },
} as const;
