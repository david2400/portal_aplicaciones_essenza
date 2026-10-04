/** @format */

import type { ProductFeatureDto } from "@/server/domains/product_details/product-features/types";

/** Valor de una característica para un producto concreto (ficha técnica). */
export type IProductFeature = ProductFeatureDto;

export type INamedItem = { id?: number; name?: string };
export type IFeatureOption = INamedItem & { unitName?: string };
