import 'server-only';

import { cache } from 'react';

import { lookups_repository } from './repository';
import type { ProductLookupParams, SkuLookupParams } from './types';

/** Para Server Components: resolver nombres de SKUs/productos por id (p. ej. en el kardex). */
export const lookup_skus = cache(async (params: SkuLookupParams) => lookups_repository.skus(params));

export const lookup_products = cache(async (params: ProductLookupParams) => lookups_repository.products(params));
