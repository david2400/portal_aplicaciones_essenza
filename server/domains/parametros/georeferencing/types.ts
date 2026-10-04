import 'server-only';

/**
 * Tipos de georreferenciación del servicio `parametros`
 * (TerritoryLookupController). Fuente: GeoOption.java, TerritoryPath.java.
 * Mismo contrato que consume apps/draco (Sede, Estudiante, Acudiente).
 */

/** Proyección mínima de un nivel territorial: lo justo para un selector. */
export interface GeoOption {
  id: number;
  code: string;
  name: string;
}

/** Cadena territorial completa de una ciudad, resuelta en una consulta. */
export interface TerritoryPath {
  country: GeoOption | null;
  state: GeoOption | null;
  city: GeoOption | null;
  locality: GeoOption | null;
  neighborhood: GeoOption | null;
  label: string;
}
