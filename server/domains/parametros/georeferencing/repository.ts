import 'server-only';

import { parametros_fetch } from '@/server/lib/server-fetch';
import { parametros_tags } from '@/server/lib/cache-tags';
import type { GeoOption, TerritoryPath } from './types';

// El servicio parametros expone sus controllers bajo el context-path
// /api/parametros (verificado en apps/draco: sin el prefijo todo da 404).
const lookup_base_path = '/api/parametros/georeferencing/lookup';

// Catálogo casi estático: 60 s de caché, igual que en apps/draco.
const REVALIDATE = 60;

export const georeferencing_repository = {
  /** GET /countries — países activos. */
  async list_countries(): Promise<GeoOption[]> {
    return parametros_fetch.get<GeoOption[]>(`${lookup_base_path}/countries`, {
      revalidate: REVALIDATE,
      tags: [parametros_tags.geo_countries()],
    });
  },

  /** GET /countries/{id}/states — un país sin departamentos devuelve []. */
  async list_states_by_country(country_id: number): Promise<GeoOption[]> {
    return parametros_fetch.get<GeoOption[]>(`${lookup_base_path}/countries/${country_id}/states`, {
      revalidate: REVALIDATE,
      tags: [parametros_tags.geo_states(country_id)],
    });
  },

  /** GET /states/{id}/cities — ciudades de un departamento. */
  async list_cities_by_state(state_id: number): Promise<GeoOption[]> {
    return parametros_fetch.get<GeoOption[]>(`${lookup_base_path}/states/${state_id}/cities`, {
      revalidate: REVALIDATE,
      tags: [parametros_tags.geo_cities(state_id)],
    });
  },

  /** GET /cities/{id}/path — país, departamento y ciudad en una sola llamada. */
  async get_city_path(city_id: number): Promise<TerritoryPath> {
    return parametros_fetch.get<TerritoryPath>(`${lookup_base_path}/cities/${city_id}/path`, {
      revalidate: REVALIDATE,
    });
  },
} as const;
