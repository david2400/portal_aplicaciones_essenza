import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type UnitDto = components['schemas']['UnitDto'];
export type SaveUnitDto = components['schemas']['SaveUnitDto'];
export type UnitConversionDto = components['schemas']['UnitConversionDto'];
export type UnitDimension = NonNullable<UnitDto['dimension']>;

export type ListUnitsParams = { dimension?: UnitDimension; include_inactive?: boolean };
export type UpdateUnitPayload = SaveUnitDto & { id: number };
