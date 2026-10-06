/** @format */

import type { AttributeDto, SaveAttributeDto } from "@/server/domains/catalog/attributes/types";

/** Atributo del catálogo (ficha técnica o eje de variante). */
export type IAttribute = AttributeDto;
export type IAttributeSaveRequest = SaveAttributeDto;

export const ATTRIBUTE_DATA_TYPES = ["TEXT", "NUMBER", "BOOLEAN", "OPTION"] as const;
export type AttributeDataType = (typeof ATTRIBUTE_DATA_TYPES)[number];

export type INamedItem = { id?: number; name?: string };

/** Sugiere un código válido a partir del nombre ("Tamaño del envase" → "tamano_del_envase"). */
export const codeFromName = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/^([0-9])/, "a_$1")
    .slice(0, 60);
