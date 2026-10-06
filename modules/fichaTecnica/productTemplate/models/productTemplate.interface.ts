/** @format */

import type { ProductTemplateDto, SaveProductTemplateDto } from "@/server/domains/catalog/product-templates/types";

/** Plantilla por tipo de producto: atributos de la ficha y ejes de variante. */
export type IProductTemplate = ProductTemplateDto;
export type IProductTemplateSaveRequest = SaveProductTemplateDto;

/** Atributo disponible para la plantilla (solo lo necesario para elegirlo). */
export type IAttributeOption = { id?: number; name?: string; code?: string; data_type?: string };
