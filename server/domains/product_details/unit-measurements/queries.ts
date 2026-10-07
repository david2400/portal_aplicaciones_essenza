import 'server-only';

import { cache } from 'react';

import { units_repository } from './repository';
import type { ListUnitsParams } from './types';

/** Unidades activas (o todas con include_inactive), ordenadas por magnitud y factor. */
export const list_units = cache(async (params: ListUnitsParams = {}) => units_repository.list_units(params));

export const get_unit = cache(async ({ id }: { id: number }) => units_repository.get_unit(id));
