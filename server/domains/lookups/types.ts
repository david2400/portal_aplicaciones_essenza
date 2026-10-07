import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type SkuLookupDto = components['schemas']['SkuLookupDto'];
export type ProductLookupDto = components['schemas']['ProductLookupDto'];
export type LookupOptionDto = components['schemas']['LookupOption'];

/** Parámetros comunes: texto libre, o ids concretos (para pintar el valor ya elegido). */
export type LookupParams = { q?: string; ids?: number[]; limit?: number };

export type SkuLookupParams = LookupParams & { product_id?: number; sellable_only?: boolean };
export type ProductLookupParams = LookupParams & { statuses?: string[] };
export type SubcategoryLookupParams = LookupParams & { category_id?: number };
