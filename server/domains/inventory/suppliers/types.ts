import 'server-only';

import type { components } from '@/server/lib/essenza-openapi-types';

export type SupplierDto = components['schemas']['SupplierDto'];
export type SaveSupplierDto = components['schemas']['SaveSupplierDto'];
export type SupplierContactDto = components['schemas']['SupplierContactDto'];
export type SupplierStatsDto = components['schemas']['SupplierStatsDto'];
export type ChangeSupplierStatusDto = components['schemas']['ChangeSupplierStatusDto'];
export type SupplierProductDto = components['schemas']['SupplierProductDto'];
export type SaveSupplierProductDto = components['schemas']['SaveSupplierProductDto'];

export type UpdateSupplierPayload = SaveSupplierDto & { id: number };

export type DeleteSupplierPayload = {
  id: number;
};
