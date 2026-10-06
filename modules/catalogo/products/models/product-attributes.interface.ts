/** @format */

import type {
  ProductAttributesDto,
  SaveProductAttributesDto,
} from "@/server/domains/catalog/product-attributes/types";
import type { AttributeDto } from "@/server/domains/catalog/attributes/types";
import type { ProductTemplateDto } from "@/server/domains/catalog/product-templates/types";

/** Ficha técnica y ejes de variante de un producto (GET/PUT /catalog/products/{id}/attributes). */
export type IProductAttributes = ProductAttributesDto;
export type IProductAttributesSaveRequest = SaveProductAttributesDto;
export type IAttributeDefinition = AttributeDto;
export type IProductTemplateDefinition = ProductTemplateDto;

/** Valor editable de un atributo (todo como texto; se convierte al guardar). */
export type AttributeDraft = { text: string; number: string; bool: "" | "true" | "false"; option: string };

export const EMPTY_DRAFT: AttributeDraft = { text: "", number: "", bool: "", option: "" };

/** Centinela para selects sin valor (Radix no admite value=""). */
export const NONE = "none";
