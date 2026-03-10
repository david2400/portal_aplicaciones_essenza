import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type UnitMeasurementDto = components['schemas']['UnitMeasurementDto'];
export type CreateUnitMeasurementDto = components['schemas']['CreateUnitMeasurementDto'];
export type UpdateUnitMeasurementDto = components['schemas']['UpdateUnitMeasurementDto'];

export type UpdateUnitMeasurementPayload = UpdateUnitMeasurementDto & { id: number };
