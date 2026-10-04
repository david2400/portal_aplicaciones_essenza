import 'server-only';

import { server_fetch } from '@/server/lib/server-fetch';
import { to_list } from '@/server/lib/list-response';
import { product_reviews_tags } from '@/server/lib/cache-tags';
import type {
  ProductReviewDto,
  CreateProductReviewDto,
  UpdateProductReviewPayload,
  VoteReviewPayload,
  ModerateReviewPayload,
} from './types';

const product_reviews_base_path = '/api/shop/reviews/product_review';
const product_reviews_page_path = '/api/shop/reviews/product_review/page';

export type ProductReviewFilters = {
  product_id?: number;
  customer_id?: number;
  rating?: number;
  only_approved?: boolean;
  only_verified_purchases?: boolean;
  start_date?: string;
  end_date?: string;
};

export type ProductReviewPageParams = {
  page?: number;
  size?: number;
  sort?: string[];
  search?: string;
};

export const product_reviews_repository = {
  async list_reviews(filters?: ProductReviewFilters): Promise<ProductReviewDto[]> {
    const params: Record<string, unknown> | undefined = filters
      ? {
          productId: filters.product_id,
          customerId: filters.customer_id,
          rating: filters.rating,
          onlyApproved: filters.only_approved,
          onlyVerifiedPurchases: filters.only_verified_purchases,
          startDate: filters.start_date,
          endDate: filters.end_date,
        }
      : undefined;

    const response = await server_fetch.get<unknown>(product_reviews_base_path, {
      params,
      revalidate: 60,
      tags: [product_reviews_tags.list()],
    });
    return to_list<ProductReviewDto>(response);
  },

  async list_reviews_paginated(
    params?: ProductReviewPageParams,
  ): Promise<ProductReviewDto[]> {
    return server_fetch.get<ProductReviewDto[]>(product_reviews_page_path, {
      params: {
        page: params?.page,
        size: params?.size,
        sort: params?.sort,
        search: params?.search,
      },
      revalidate: 60,
      tags: [product_reviews_tags.pages()],
    });
  },

  async get_review_by_id(id: number): Promise<ProductReviewDto> {
    return server_fetch.get<ProductReviewDto>(`${product_reviews_base_path}/${id}`, {
      revalidate: 60,
      tags: [product_reviews_tags.review(id)],
    });
  },

  async create_review(payload: CreateProductReviewDto): Promise<ProductReviewDto> {
    return server_fetch.post<ProductReviewDto>(product_reviews_base_path, payload, {
      revalidate: false,
    });
  },

  async update_review(payload: UpdateProductReviewPayload): Promise<ProductReviewDto> {
    return server_fetch.put<ProductReviewDto>(`${product_reviews_base_path}/${payload.id}`, payload, {
      revalidate: false,
    });
  },

  async delete_review(id: number): Promise<void> {
    return server_fetch.delete<void>(`${product_reviews_base_path}/${id}`, {
      revalidate: false,
    });
  },

  async vote_review_helpful(payload: VoteReviewPayload): Promise<void> {
    return server_fetch.post<void>(`${product_reviews_base_path}/${payload.id}/vote`, payload, {
      revalidate: false,
    });
  },

  async moderate_review(payload: ModerateReviewPayload): Promise<ProductReviewDto> {
    return server_fetch.post<ProductReviewDto>(
      `${product_reviews_base_path}/${payload.id}/moderate`,
      payload,
      {
        revalidate: false,
      },
    );
  },
} as const;
