/** @format */

import type { TypeProductFeatureDto } from "@/server/domains/product_details/type-product-features/types";

/** Característica asignada a un tipo de producto (plantilla de ficha técnica). */
export type ITypeProductFeature = TypeProductFeatureDto;

export type INamedItem = { id?: number; name?: string };
